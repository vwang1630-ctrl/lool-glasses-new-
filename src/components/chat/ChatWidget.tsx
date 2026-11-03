import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { ChatPanel } from "./ChatPanel";

/**
 * Floating AI chat widget. Mounted in __root.tsx so it appears on all
 * customer-facing pages.
 *
 * Positioning follows the professional chat-widget convention:
 *   • Mobile (≤768px, i.e. below the `md` breakpoint): opening the chat
 *     expands into a bottom sheet inset 8px from each screen edge — width
 *     `calc(100vw - 16px)` — so it is fully visible edge-to-edge on any phone
 *     with no pinch/zoom or dragging needed. It uses the same light site theme
 *     as the desktop card, covers the sticky buy bar while open, and sits
 *     above the page with no backdrop. The toggle button is hidden while the
 *     sheet is open — the sheet header carries its own close button.
 *   • md+: a floating card anchored bottom-right above the toggle button,
 *     width capped at `min(380px, calc(100vw - 16px))`, with the button always
 *     reachable.
 *
 * Both surfaces are content-adaptive: they grow to fit their content but cap
 * against the *visible* viewport so they never run past the screen edge and
 * never need manual shrinking. The sheet measures the visual viewport
 * (adapting to rotation, browser chrome and the on-screen keyboard), and the
 * card caps its width/height with min() against the viewport (see __root
 * viewport meta `interactive-widget=resizes-content`, which makes
 * Chrome/Android resize the layout viewport when the keyboard opens).
 *
 * The button lifts above the site-wide sticky bottom bar (currently the mobile
 * PDP buy bar, marked [data-sticky-bottom-bar]) so it never covers the buy CTA.
 * The bar is `md:hidden`, so sm+ keeps the plain 16px gutter. Height is
 * re-measured on route/viewport changes.
 */

/** Tracks the visible viewport — the visual viewport where available (it
 *  shrinks when the browser chrome or the on-screen keyboard covers the
 *  screen), plus the layout-viewport height and the visual viewport's vertical
 *  offset. Used to size the mobile chat sheet to what the user can actually see
 *  and to lift it above the on-screen keyboard so the input is never covered.
 *
 *  layoutHeight (window.innerHeight) only shrinks when the layout viewport
 *  resizes (Chrome/Android with `interactive-widget=resizes-content`). On iOS
 *  and other browsers it stays at the full-screen height while the visual
 *  viewport collapses under the keyboard, so the difference is what the
 *  keyboard covers. */
function useVisibleHeight() {
  const [m, setM] = useState<{ vh: number; lh: number; top: number }>(() =>
    typeof window === "undefined"
      ? { vh: 0, lh: 0, top: 0 }
      : {
          vh: window.visualViewport?.height ?? window.innerHeight,
          lh: window.innerHeight,
          top: window.visualViewport?.offsetTop ?? 0,
        },
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const measure = () =>
      setM({
        vh: window.visualViewport?.height ?? window.innerHeight,
        lh: window.innerHeight,
        top: window.visualViewport?.offsetTop ?? 0,
      });
    measure();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, []);

  return m;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [barOffset, setBarOffset] = useState(0);
  const {
    vh: visibleHeight,
    lh: layoutHeight,
    top: vvTop,
  } = useVisibleHeight();
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Height of the area hidden below the visual viewport bottom — i.e. the strip
  // covered by the on-screen keyboard (visualViewport.height < innerHeight) or
  // browser chrome. On iOS the layout viewport stays full-height while the
  // keyboard covers the bottom, so `fixed bottom-0` would leave the input
  // hidden. Lifting the sheet by this offset keeps it pinned to what the user
  // can actually see. 0 when nothing is covered.
  const keyboardOffset =
    visibleHeight > 0 && layoutHeight > 0
      ? Math.max(0, layoutHeight - vvTop - visibleHeight)
      : 0;

  useEffect(() => {
    const measure = () => {
      const bar = document.querySelector<HTMLElement>(
        "[data-sticky-bottom-bar]",
      );
      setBarOffset(
        bar && getComputedStyle(bar).display !== "none"
          ? bar.getBoundingClientRect().height
          : 0,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  // Max height of the mobile sheet: 85% of the *visible* viewport, measured at
  // open time and re-measured when the visible area changes (rotation, browser
  // chrome, keyboard). The sheet grows with its content up to this cap, so it
  // always fits the screen without the user having to shrink anything. The
  // max-h-[85dvh] class is the graceful baseline for the brief
  // pre-measurement render; the inline style owns the final cap.
  const sheetMaxHeight =
    visibleHeight > 0 ? `${Math.round(visibleHeight * 0.85)}px` : undefined;

  return (
    <>
      {/* Mobile chat — full-width bottom sheet, same light site theme as the
          desktop card. Only the rounded top is exposed; the sheet covers the
          sticky buy bar (z-50 > z-40) while open. The FAB is hidden on mobile,
          the sheet header carries its own close button. Height is
          content-adaptive capped at the visible viewport (see sheetMaxHeight),
          so it never needs manual shrinking. */}
      {open && (
        <div
          className="chat-widget-sheet fixed inset-x-2 z-50 flex max-h-[85dvh] flex-col overflow-hidden rounded-[24px] bg-card shadow-2xl animate-in slide-in-from-bottom duration-300 transition-[bottom] duration-300 md:hidden"
          style={{
            bottom: `${keyboardOffset}px`,
            maxHeight: sheetMaxHeight,
            width: "min(100%, calc(100vw - 16px))",
            maxWidth: "calc(100vw - 16px)",
          }}
        >
          <ChatPanel onClose={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop floating card + toggle. Hidden entirely on mobile while the
          sheet is open. */}
      <div
        className={`chat-widget-desktop fixed right-4 z-50 flex flex-col items-end gap-3 ${
          open ? "hidden md:flex" : "flex"
        }`}
        style={{
          bottom: `calc(16px + ${barOffset}px + ${keyboardOffset}px + env(safe-area-inset-bottom))`,
        }}
      >
        {open && (
          <div
            className="chat-widget-card flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
            style={{
              width: "min(380px, calc(100vw - 16px))",
              maxWidth: "calc(100vw - 16px)",
              maxHeight:
                visibleHeight > 0
                  ? `min(620px, ${Math.round(visibleHeight * 0.8)}px)`
                  : "min(620px, calc(100dvh - 8rem))",
            }}
          >
            <ChatPanel onClose={() => setOpen(false)} />
          </div>
        )}

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
            open
              ? "bg-secondary text-foreground hover:bg-secondary/80 rotate-0"
              : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
          }`}
          aria-label={open ? t("chat.close") : t("chat.open")}
          aria-expanded={open}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </button>
      </div>
    </>
  );
}
