import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cleanup: undefined as void | (() => void),
  mutationCallback: undefined as undefined | (() => void),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useLayoutEffect: (effect: () => void | (() => void)) => {
      mocks.cleanup = effect();
    },
  };
});

import { ScrollLockStabilizer } from "./scroll-lock-stabilizer";

describe("ScrollLockStabilizer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cleanup = undefined;
    mocks.mutationCallback = undefined;
  });

  it("keeps the removed-scrollbar CSS variable in sync while unlocked", () => {
    const documentStyle = { setProperty: vi.fn() };
    const bodyStyle = { setProperty: vi.fn() };
    const listeners = new Map<string, () => void>();
    let clientWidth = 980;
    let scrollLocked = false;

    vi.stubGlobal("document", {
      body: {
        hasAttribute: vi.fn(() => scrollLocked),
        style: bodyStyle,
      },
      documentElement: {
        get clientWidth() {
          return clientWidth;
        },
        style: documentStyle,
      },
    });
    vi.stubGlobal("window", {
      innerWidth: 1000,
      addEventListener: vi.fn((event: string, callback: () => void) => listeners.set(event, callback)),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 7;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("MutationObserver", vi.fn(function MutationObserver(callback: () => void) {
      mocks.mutationCallback = callback;
      return {
        disconnect: vi.fn(),
        observe: vi.fn(),
      };
    }));

    renderToStaticMarkup(React.createElement(ScrollLockStabilizer));

    expect(documentStyle.setProperty).toHaveBeenCalledWith("--removed-body-scroll-bar-size", "20px", "important");
    expect(bodyStyle.setProperty).toHaveBeenCalledWith("--removed-body-scroll-bar-size", "20px", "important");

    clientWidth = 990;
    listeners.get("resize")?.();
    expect(documentStyle.setProperty).toHaveBeenLastCalledWith("--removed-body-scroll-bar-size", "10px", "important");

    listeners.get("resize")?.();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
    expect(documentStyle.setProperty).toHaveBeenCalledTimes(2);

    scrollLocked = true;
    clientWidth = 970;
    mocks.mutationCallback?.();
    expect(documentStyle.setProperty).toHaveBeenLastCalledWith("--removed-body-scroll-bar-size", "10px", "important");

    mocks.cleanup?.();
    expect(window.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
