"use client";

import * as React from "react";

function getScrollbarGapPx() {
  const documentWidth = document.documentElement?.clientWidth ?? window.innerWidth;
  return Math.max(0, window.innerWidth - documentWidth);
}

export function ScrollLockStabilizer() {
  React.useLayoutEffect(() => {
    let lastGapPx = getScrollbarGapPx();

    const applyGap = (gapPx: number) => {
      document.documentElement?.style.setProperty(
        "--removed-body-scroll-bar-size",
        `${gapPx}px`,
        "important"
      );
      document.body?.style.setProperty("--removed-body-scroll-bar-size", `${gapPx}px`, "important");
    };

    const refreshGapIfUnlocked = () => {
      if (document.body.hasAttribute("data-scroll-locked")) return;
      const next = getScrollbarGapPx();
      if (next === lastGapPx) return;
      lastGapPx = next;
      applyGap(lastGapPx);
    };

    applyGap(lastGapPx);

    let rafId = 0;
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => refreshGapIfUnlocked());
    };

    window.addEventListener("resize", onResize);

    const observer = new MutationObserver(() => {
      if (document.body.hasAttribute("data-scroll-locked")) {
        applyGap(lastGapPx);
        return;
      }
      refreshGapIfUnlocked();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
