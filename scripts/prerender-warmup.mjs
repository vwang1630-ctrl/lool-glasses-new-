#!/usr/bin/env node
/**
 * Cache warm-up / pseudo-static pre-render pass.
 *
 * The site is SSR with pseudo-static `.html` URLs, so there are no files to
 * emit — "pre-rendering" here means rendering every locale URL once so the
 * SSR translation dictionary and data caches are populated before traffic
 * hits production.
 *
 * Usage:
 *   node scripts/prerender-warmup.mjs [--base http://localhost:8080] [--passes 2] [--concurrency 4]
 */

const args = process.argv.slice(2);
function arg(name, fallback) {
  // Accepts both `--name value` and `--name=value`.
  const inline = args.find((a) => a.startsWith(`--${name}=`));
  if (inline) return inline.slice(name.length + 3);
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

const BASE = (arg("base", process.env.WARMUP_BASE || "http://localhost:8080")).replace(/\/$/, "");
const PASSES = Number(arg("passes", "2"));
const CONCURRENCY = Number(arg("concurrency", "4"));
const TIMEOUT_MS = Number(arg("timeout", "45000"));

async function get(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { accept: "text/html", "user-agent": "fuzzsofa-warmup/1.0" },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Private / dynamic pages that never appear in sitemap.xml (auth-gated or
 * query-driven) but still need their dictionary registered per language.
 */
const EXTRA_ROUTES = [
  "/checkout.html",
  "/checkout.html?buyNow=1",
  "/account.html",
  "/account.html#orders",
  "/account.html#favorites",
  "/account.html#addresses",
  "/account.html#settings",
  "/cart.html",
  "/payment.html",
  "/order-confirmed.html",
  "/login.html",
  "/reset-password.html",
  "/ai-room-preview.html",
];

async function collectUrls() {
  const res = await get(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/&amp;/g, "&"),
  );

  const langs = new Set();
  const urls = [];
  for (const loc of locs) {
    try {
      const u = new URL(loc);
      const lang = u.pathname.split("/")[1];
      if (lang) langs.add(lang);
      urls.push(`${BASE}${u.pathname}${u.search}`);
    } catch {
      /* ignore malformed loc */
    }
  }

  for (const lang of langs) {
    for (const route of EXTRA_ROUTES) {
      urls.push(`${BASE}/${lang}${route}`);
    }
  }

  const seen = new Set();
  return urls.filter((u) => !seen.has(u) && seen.add(u));
}


async function runPool(urls, worker) {
  let index = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
    while (index < urls.length) {
      const i = index++;
      await worker(urls[i], i);
    }
  });
  await Promise.all(workers);
}

/**
 * Client-only screens (the mobile app shell) never render during SSR, so their
 * literals are never buffered by the server. Extract every `$t("…")` argument
 * from the source tree and register it per language, so the dictionary is
 * complete before a real device ever opens checkout / account.
 */
async function registerClientLiterals(langs) {
  const { readdirSync, readFileSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");

  const texts = new Set();
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.(tsx|ts)$/.test(name)) {
        const src = readFileSync(full, "utf8");
        for (const m of src.matchAll(/\$t\(\s*"((?:[^"\\]|\\.)+)"/g)) {
          texts.add(m[1].replace(/\\"/g, '"'));
        }
        for (const m of src.matchAll(/\$t\(\s*'((?:[^'\\]|\\.)+)'/g)) {
          texts.add(m[1].replace(/\\'/g, "'"));
        }
      }
    }
  };
  walk("src");

  const items = [...texts].map((text) => ({ text, category: "ui" }));
  console.log(`[warmup] ${items.length} UI literals extracted from source`);

  for (const lang of langs) {
    for (let i = 0; i < items.length; i += 100) {
      const batch = items.slice(i, i + 100);
      try {
        await fetch(`${BASE}/api/public/ui-strings`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ items: batch, lang, path: "/warmup" }),
        });
      } catch (err) {
        console.log(`  [warmup] literal registration failed (${lang}): ${err?.message || err}`);
      }
    }
    console.log(`[warmup] literals registered for ${lang}`);
  }
}

async function main() {
  console.log(`[warmup] base = ${BASE}`);
  // Only warm the languages that are actually live. Default: zh only —
  // pass `--langs zh,ja` (or `all`) to widen the pass.
  const langFilter = arg("langs", "zh");
  const allUrls = await collectUrls();
  const allLangs = [...new Set(allUrls.map((u) => new URL(u).pathname.split("/")[1]).filter(Boolean))];
  const wanted =
    langFilter === "all"
      ? allLangs
      : langFilter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  // An explicitly requested language is warmed even when the sitemap has no
  // URLs for it yet (newly added locales), by rewriting another locale's paths.
  const langs = langFilter === "all" ? allLangs : wanted;
  const template = allLangs[0];
  const urls = langs.flatMap((lang) => {
    const own = allUrls.filter((u) => new URL(u).pathname.split("/")[1] === lang);
    if (own.length || !template) return own;
    return allUrls
      .filter((u) => new URL(u).pathname.split("/")[1] === template)
      .map((u) => {
        const url = new URL(u);
        const parts = url.pathname.split("/");
        parts[1] = lang;
        url.pathname = parts.join("/");
        return url.toString();
      });
  });
  console.log(`[warmup] ${urls.length} locale URLs (${langs.join(", ")}) of ${allUrls.length} total`);

  await registerClientLiterals(langs);


  const failures = [];
  for (let pass = 1; pass <= PASSES; pass++) {
    const started = Date.now();
    let ok = 0;
    failures.length = 0;
    await runPool(urls, async (url) => {
      try {
        const res = await get(url);
        if (res.ok) {
          await res.text(); // drain so SSR streaming completes
          ok++;
        } else {
          failures.push(`${res.status} ${url}`);
        }
      } catch (err) {
        failures.push(`ERR ${url} — ${err?.message || err}`);
      }
    });
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`[warmup] pass ${pass}/${PASSES}: ${ok}/${urls.length} ok in ${secs}s`);
    for (const f of failures) console.log(`  [warmup] fail: ${f}`);
    // Let the background translation flush settle before the verification pass.
    if (pass < PASSES) await new Promise((r) => setTimeout(r, 3000));
  }

  if (failures.length) {
    console.error(`[warmup] ${failures.length} URL(s) failed on the final pass`);
    process.exit(1);
  }
  console.log("[warmup] all locale pages rendered successfully — caches primed");
}

main().catch((err) => {
  console.error("[warmup] fatal:", err);
  process.exit(1);
});
