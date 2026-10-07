// deploy-keep-assets.cjs — 部署资产宽限期(2026-09-30,站主手机"总是出现错误边界"根治)
//
// 问题:构建会整体替换 .output/public/assets(内容哈希文件名)。手机/已开标签页
// 里的旧 HTML 引用旧哈希,部署后 404/500 → 懒加载路由炸进错误边界
// (实证:client_errors 2026-10-01 09:41,/en/account.html 旧 chunk 连环 404)。
//
// 用法:构建前 `node scripts/deploy-keep-assets.cjs keep`
//       构建后 `node scripts/deploy-keep-assets.cjs merge`
// keep: 把当前 .output/public/assets 存为 .prev-assets(覆盖上一代)
// merge: 把 .prev-assets 里新构建缺失的文件补回(只补 js/css/webmanifest,防陈旧引用断链)
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(ROOT, ".output", "public", "assets");
const PREV = path.join(ROOT, ".prev-assets");
const MODE = process.argv[2] || "keep";

function copyMissing(srcDir, dstDir) {
  let n = 0;
  for (const e of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, e.name), d = path.join(dstDir, e.name);
    if (e.isDirectory()) { n += copyMissing(s, d); continue; }
    if (!fs.existsSync(d)) { fs.copyFileSync(s, d); n++; }
  }
  return n;
}

try {
  if (MODE === "keep") {
    // 构建指纹写入源级 public/(随构建烤入 nitro 静态清单)
    fs.writeFileSync(path.join(ROOT, "public", "version.json"), JSON.stringify({ v: Date.now() }));
    if (fs.existsSync(ASSETS)) {
      // 累积式:合入 .prev-assets(不覆盖已存文件),再按 mtime 修剪 30 天前的旧文件
      // ——手机可能几周不来访,单代宽限不够;累积+修剪=长期无害
      const n = copyMissing(ASSETS, PREV);
      const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
      let pruned = 0;
      const prune = (dir) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const f = path.join(dir, e.name);
          if (e.isDirectory()) { prune(f); continue; }
          if (fs.statSync(f).mtimeMs < cutoff) { fs.rmSync(f); pruned++; }
        }
      };
      prune(PREV);
      console.log(`[keep-assets] 累积 ${n} 项新资源,修剪 ${pruned} 个超30天旧文件`);
    } else {
      console.log("[keep-assets] 无现有 assets,跳过");
    }
  } else if (MODE === "merge") {
    if (fs.existsSync(PREV)) {
      const n = copyMissing(PREV, ASSETS);
      console.log(`[keep-assets] 补回上一代资源 ${n} 个(旧引用不断链)`);
    } else {
      console.log("[keep-assets] 无 .prev-assets,跳过 merge");
    }
    // 构建指纹:前端自愈探针比对用
    fs.writeFileSync(path.join(ASSETS, "..", "version.json"), JSON.stringify({ v: Date.now() }));
  } else {
    console.error("用法: deploy-keep-assets.cjs keep|merge");
    process.exit(1);
  }
} catch (e) {
  console.error("[keep-assets] 失败(不阻断部署):", e.message);
}
