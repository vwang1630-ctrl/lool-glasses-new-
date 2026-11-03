// make-system-kit.mjs — 生成 loollook SYSTEM-KIT 镜像并做库级健康检查
// 用法: node scripts/system-kit/make-system-kit.mjs
// 退出码: 0 = 镜像可用；1 = 有阻断缺陷

import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { resolve, join, basename } from "node:path";

const ROOT = process.cwd();
const LIB_DIR = resolve(ROOT, "docs/system-kit/library");
const ARCHIVE_DIR = resolve(ROOT, "docs/system-kit/archive");
const SKILL_DIR = resolve(ROOT, ".claude/skills");
const SNAPSHOT = resolve(
  ARCHIVE_DIR,
  `system-kit-snapshot-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
);

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
  console.log(`  ✗ ${msg}`);
}

function warn(msg) {
  warnings.push(msg);
  console.log(`  ⚠ ${msg}`);
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function extractIndexFiles(text) {
  const files = new Set();
  // Match table cells that contain a filename with extension (md/json)
  for (const line of text.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").map((c) => c.trim());
    for (const cell of cells) {
      const m = cell.match(/`?([^`\s]+\.(?:md|json))`?/);
      if (m) files.add(m[1]);
    }
  }
  return files;
}

async function validateJson(path) {
  const text = await readFile(path, "utf8");
  try {
    JSON.parse(text);
    return true;
  } catch (e) {
    fail(`${basename(path)} JSON parse error: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("=== make-system-kit ===\n");

  // 1. INDEX 登记检查
  const indexPath = join(LIB_DIR, "INDEX.md");
  if (!(await exists(indexPath))) {
    fail("INDEX.md missing");
    process.exit(1);
  }
  const indexText = await readFile(indexPath, "utf8");
  const indexedFiles = extractIndexFiles(indexText);
  ok(`INDEX.md parsed, ${indexedFiles.size} library files referenced`);

  // 2. 每个登记文件存在且 JSON 可解析
  const libEntries = await readdir(LIB_DIR, { withFileTypes: true });
  const libFiles = libEntries
    .filter((e) => e.isFile() && e.name !== "INDEX.md")
    .map((e) => e.name);

  for (const f of indexedFiles) {
    const fpath = resolve(LIB_DIR, f);
    if (!(await exists(fpath))) {
      fail(`INDEX references missing library file: ${f}`);
      continue;
    }
    if (f.endsWith(".json")) {
      await validateJson(fpath);
    }
  }
  ok("All indexed files exist");

  // 3. 反查：库根目录下的 .json/.md 都被 INDEX 登记（fixtures/ 子目录除外）
  for (const f of libFiles) {
    if (f.endsWith(".json") || f.endsWith(".md")) {
      // Accept either bare name or ../ relative path for files outside library/
      const referenced = indexedFiles.has(f) || indexedFiles.has(`../${f}`);
      if (!referenced) {
        warn(`Library file not indexed: ${f}`);
      }
    }
  }

  // 4. system-versions 一致性
  const svPath = join(LIB_DIR, "system-versions.json");
  if (await exists(svPath)) {
    const svText = await readFile(svPath, "utf8");
    const sv = JSON.parse(svText);
    const seen = new Set();
    for (const src of sv.sources || []) {
      if (seen.has(src.file)) {
        fail(`system-versions duplicate source: ${src.file}`);
      }
      seen.add(src.file);
      const srcPath = resolve(LIB_DIR, src.file);
      if (!(await exists(srcPath))) {
        fail(`system-versions source missing: ${src.file}`);
      }
      if (!src.version || !src.updated) {
        warn(`system-versions entry incomplete: ${src.file}`);
      }
    }
    ok("system-versions.json sources valid");
  }

  // 5. framework-lock 关键键
  const flPath = join(LIB_DIR, "framework-lock.json");
  if (await exists(flPath)) {
    const fl = JSON.parse(await readFile(flPath, "utf8"));
    const required = [
      "sections",
      "trust_kit",
      "delivery_rule",
      "forbidden_words",
      "ai_vs_real_policy",
    ];
    for (const k of required) {
      if (!(k in fl)) fail(`framework-lock.json missing key: ${k}`);
    }
    if (Array.isArray(fl.sections) && fl.sections.length !== 14) {
      warn(
        `framework-lock sections count = ${fl.sections.length} (expected 14)`,
      );
    }
    ok("framework-lock.json required keys present");
  }

  // 6. blog-framework-lock 关键键
  const bflPath = join(LIB_DIR, "blog-framework-lock.json");
  if (await exists(bflPath)) {
    const bfl = JSON.parse(await readFile(bflPath, "utf8"));
    for (const k of [
      "template",
      "storage",
      "content_contract",
      "ai_subjects",
      "ai_label_tokens",
    ]) {
      if (!(k in bfl)) fail(`blog-framework-lock.json missing key: ${k}`);
    }
    ok("blog-framework-lock.json required keys present");
  }

  // 7. 技能路径不含 Fuzz Sofa 残留
  const skillNames = ["lool-operator", "lool-produce"];
  for (const name of skillNames) {
    const skillFile = join(SKILL_DIR, name, "SKILL.md");
    if (!(await exists(skillFile))) {
      fail(`Skill file missing: ${name}/SKILL.md`);
      continue;
    }
    const text = await readFile(skillFile, "utf8");
    const bad = ["fuzzsofa.com", "docs/library/", "Fuzz Sofa"];
    for (const token of bad) {
      if (text.includes(token)) {
        fail(`Skill ${name} references Fuzz artifact: ${token}`);
      }
    }
  }
  ok("Skills free of Fuzz Sofa references");

  // 8. 生成镜像
  const manifest = {
    generated_at: new Date().toISOString(),
    library_root: "docs/system-kit/library",
    indexed_files: [...indexedFiles].sort(),
    library_files: libFiles.sort(),
    system_versions_path: "docs/system-kit/library/system-versions.json",
    skills_checked: skillNames,
    errors,
    warnings,
    ok: errors.length === 0,
  };

  await writeFile(SNAPSHOT, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`\nSnapshot written: ${SNAPSHOT}`);

  // 9. 汇总
  console.log("\n=== Summary ===");
  console.log(`Errors:   ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  if (errors.length > 0) {
    console.log("\nSYSTEM-KIT: FAIL — fix errors before release");
    process.exit(1);
  }
  console.log("\nSYSTEM-KIT: OK — mirror ready");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
