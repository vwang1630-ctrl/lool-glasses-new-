// Build identity surfaced to the UI (Footer) so we can read off a deployed
// page what code is running. Both are injected by vite.config.ts at build
// time via `define`. Cross-reference with `git log` or with the Version ID
// Claude reports after a wrangler deploy.

declare global {
  const __BUILD_GIT_SHA__: string;
  const __BUILD_TIME__: string;
}

export const BUILD_GIT_SHA: string = __BUILD_GIT_SHA__;
export const BUILD_TIME: string = __BUILD_TIME__;
