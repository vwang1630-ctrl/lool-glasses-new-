// PWA install hook — handles three things for the Footer's "Download the lool
// app" button:
//
//   1. Registers /sw.js once per session so Chrome's installability check
//      sees a service worker.
//   2. Captures the `beforeinstallprompt` event when the browser decides the
//      site is installable, so we can fire it on demand from a real user
//      click (Chrome / Edge / Brave).
//   3. Detects Apple's Safari variants — both reject `beforeinstallprompt`
//      and require a manual install flow:
//        * iOS Safari → Share menu → "Add to Home Screen"
//        * macOS Safari (Sonoma 14+) → File menu → "Add to Dock"
//      Returns a state the UI can use to show the right instructions.
//
// State enum the UI consumes:
//   "loading"          — first render before we know the browser's stance
//   "ready"            — beforeinstallprompt captured; click install() to prompt
//   "installed"        — the app is already installed (display-mode: standalone
//                        OR we caught the appinstalled event)
//   "ios-hint"         — iOS Safari; show the manual A2HS instructions
//   "mac-safari-hint"  — macOS Safari; show the File → Add to Dock instructions
//   "unsupported"      — desktop browser without install support (Firefox, etc.)
//                        OR running inside a webview where installs aren't possible

import { useCallback, useEffect, useState } from "react";

export type PwaInstallState =
  | "loading"
  | "ready"
  | "installed"
  | "ios-hint"
  | "mac-safari-hint"
  | "unsupported";

// Shape of the chrome-specific event. `prompt()` shows the UA install UI;
// `userChoice` resolves once the user accepts/dismisses.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let swRegistered = false;

function registerServiceWorker() {
  if (swRegistered) return;
  swRegistered = true;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  // Defer past first paint so SW registration doesn't compete with page load.
  if (document.readyState === "complete") {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  } else {
    window.addEventListener(
      "load",
      () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      },
      { once: true },
    );
  }
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPadOS reports MacIntel + maxTouchPoints > 1; legacy iPhones say iPhone.
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (ua.includes("Macintosh") &&
      typeof (navigator as Navigator & { maxTouchPoints?: number })
        .maxTouchPoints === "number" &&
      (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! >
        1)
  );
}

// macOS Safari only — excludes Chrome/Edge/etc (which also include "Safari" in
// their UA strings) and excludes iPadOS (which we already classify as iOS via
// the maxTouchPoints check above). macOS Sonoma 14+ supports File → Add to
// Dock; older macOS Safari can't install but the hint at least tells the user
// what their browser can do.
function isMacSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  if (isIos()) return false;
  const ua = navigator.userAgent;
  const isSafari =
    /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR|Brave/i.test(ua);
  const isMac = /Macintosh|Mac OS X/i.test(ua);
  return isSafari && isMac;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS Safari uses a vendor prefix.
  return (
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true
  );
}

export function usePwaInstall(): {
  state: PwaInstallState;
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
} {
  const [state, setState] = useState<PwaInstallState>("loading");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    registerServiceWorker();

    if (isStandalone()) {
      setState("installed");
      return;
    }

    const onBeforeInstall = (e: Event) => {
      // Prevent the silent mini-infobar — we own the UI affordance now.
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setState("ready");
    };
    const onInstalled = () => {
      setDeferred(null);
      setState("installed");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // Safari (iOS + macOS) never fires beforeinstallprompt — show the
    // platform-specific manual install hint. Give Chrome ~1s grace to fire
    // its event before deciding we're stuck.
    const fallbackTimer = window.setTimeout(() => {
      setState((cur) => {
        if (cur !== "loading") return cur;
        if (isIos()) return "ios-hint";
        if (isMacSafari()) return "mac-safari-hint";
        return "unsupported";
      });
    }, 1000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  const install = useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    if (!deferred) return "unavailable";
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      // beforeinstallprompt is one-shot; clear so the button reflects reality.
      setDeferred(null);
      if (outcome === "accepted") setState("installed");
      return outcome;
    } catch {
      return "unavailable";
    }
  }, [deferred]);

  return { state, install };
}
