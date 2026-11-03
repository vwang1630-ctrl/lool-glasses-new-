import { useEffect } from "react";

// Kill iOS Safari / WKWebView rubber-band (visual viewport bounce when a touch
// drag passes the scroll boundary of the document or any internal scroller).
// `overscroll-behavior: none` on html/body is honored on iOS 16+ Safari for
// the document scroll, but inside 3rd-party in-app WebViews (e.g. Grab) and on
// internal `fixed inset-0 overflow-y-auto` modals (the lens wizard, the PDP
// mobile sheet, size modal, filter drawer) it leaks: pulling past the
// boundary still pulls the visual viewport down and exposes blank area behind
// the fixed layer.
//
// Strategy: at each touchmove, walk from the touch target up looking for the
// nearest vertically scrollable ancestor. If found, only preventDefault when
// the move would push past its boundary. If no scrollable ancestor (touch is
// over non-scrolling content or the document is shorter than the viewport),
// preventDefault unconditionally so the visual viewport can't bounce.
//
// Horizontal swipes (|dx| > |dy|) are left alone so horizontal carousels keep
// working.
export function useNoRubberBand() {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let lastY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      lastY = startY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      if (Math.abs(x - startX) > Math.abs(y - startY)) return;

      const dy = y - lastY;
      lastY = y;
      if (dy === 0) return;

      let el: HTMLElement | null = e.target as HTMLElement | null;
      while (el && el !== document.body && el !== document.documentElement) {
        const style = getComputedStyle(el);
        const oy = style.overflowY;
        const scrollable =
          (oy === "auto" || oy === "scroll") &&
          el.scrollHeight > el.clientHeight;
        if (scrollable) {
          const atTop = el.scrollTop <= 0;
          const atBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 0.5;
          if ((atTop && dy > 0) || (atBottom && dy < 0)) {
            if (e.cancelable) e.preventDefault();
          }
          return;
        }
        el = el.parentElement;
      }

      const doc = document.documentElement;
      const atTopDoc = window.scrollY <= 0;
      const atBottomDoc =
        window.scrollY + window.innerHeight >= doc.scrollHeight - 0.5;
      if ((atTopDoc && dy > 0) || (atBottomDoc && dy < 0)) {
        if (e.cancelable) e.preventDefault();
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, []);
}
