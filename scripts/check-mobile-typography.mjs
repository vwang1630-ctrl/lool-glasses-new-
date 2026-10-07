#!/usr/bin/env node
/**
 * Mobile typography consistency check.
 *
 * Rule: body copy on mobile screens must stay at 14px (text-sm / text-[14px])
 * or smaller, and must never use a serif face (Playfair is headings only).
 *
 * Scanned: <p> and <li> elements in src/pages/**\/*.tsx.
 * Escape hatch: put `typo-ok` in a comment on the same line.
 *
 * Usage: node scripts/check-mobile-typography.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src/pages"];
const BODY_TAGS = ["p", "li"];
const MAX_PX = 14;
const MIN_PX = 11; // V6.4：下限护栏——9/10px 在手机上不可读（eyebrow 用 text-micro/10px 者以 typo-ok 豁免）

/** Tailwind named sizes -> px */
const NAMED = {
  "text-xs": 12,
  "text-sm": 14,
  "text-base": 16,
  "text-lg": 18,
  "text-xl": 20,
  "text-2xl": 24,
  "text-3xl": 30,
  "text-4xl": 36,
  "text-5xl": 48,
  "text-6xl": 60,
  "text-7xl": 72,
};

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx$/.test(entry)) out.push(full);
  }
  return out;
}

function sizeOf(classes) {
  const arbitrary = classes.match(/\btext-\[(\d+(?:\.\d+)?)px\]/);
  if (arbitrary) return Number(arbitrary[1]);
  for (const [name, px] of Object.entries(NAMED)) {
    if (new RegExp(`(?:^|[\\s"'\`])${name}(?:[\\s"'\`]|$)`).test(classes)) return px;
  }
  return null;
}

const findings = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const src = readFileSync(file, "utf8");
    const lines = src.split("\n");
    const tagRe = new RegExp(`<(${BODY_TAGS.join("|")})\\s[^>]*?>`, "gs");
    let m;
    while ((m = tagRe.exec(src)) !== null) {
      const tag = m[0];
      const line = src.slice(0, m.index).split("\n").length;
      if (/typo-ok/.test(lines[line - 1] ?? "")) continue;

      const classes = [...tag.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)]
        .map((c) => c[1] ?? c[2] ?? "")
        .join(" ");

      const px = sizeOf(classes);
      if (px !== null && px > MAX_PX) {
        findings.push({ file, line, issue: `body <${m[1]}> is ${px}px (max ${MAX_PX}px)` });
      }
      if (px !== null && px < MIN_PX) {
        findings.push({ file, line, issue: `body <${m[1]}> is ${px}px (min ${MIN_PX}px — unreadable on phones)` });
      }
      if (/\bfont-serif\b/.test(classes) || /var\(--font-serif\)|var\(--font-display\)/.test(tag)) {
        findings.push({ file, line, issue: `body <${m[1]}> uses a serif face (headings only)` });
      }
    }
  }
}

if (findings.length === 0) {
  console.log("✓ Mobile typography consistent — no oversized or serif body copy found.");
  process.exit(0);
}

console.log(`✗ ${findings.length} typography issue(s):\n`);
for (const f of findings) {
  console.log(`  ${relative(ROOT, f.file)}:${f.line}  ${f.issue}`);
}
process.exit(1);
