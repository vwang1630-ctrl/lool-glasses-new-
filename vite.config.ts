// Vite config aligned with TanStack Start's official Cloudflare hosting guide.
// Replaces @lovable.dev/vite-tanstack-config because that preset only enables the
// cloudflare plugin at build time, leaving `cloudflare:workers` (D1/R2 bindings)
// unresolvable during `vite dev`. We need them in dev too.
import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Capture the git short SHA + build timestamp at config time so the
// frontend can show "what code am I running" — surfaced in the Footer as a
// muted "v7c6fa6f · 2026-05-25T03:42Z". Cross-reference with `git log` or
// with the Version Claude says it deployed. Falls back to "dev" if git
// isn't available (e.g. a built tarball without history).
function readGitSha(): string {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
}
const BUILD_GIT_SHA = readGitSha();
const BUILD_TIME = new Date().toISOString();

export default defineConfig({
  server: {
    port: 8080,
    strictPort: false,
  },
  define: {
    __BUILD_GIT_SHA__: JSON.stringify(BUILD_GIT_SHA),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
