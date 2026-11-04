import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  roots: [] as any[],
  scrollbars: [] as any[],
}));

vi.mock("@radix-ui/react-scroll-area", async () => {
  const ReactModule = await import("react");
  return {
    Root: ReactModule.forwardRef((props: any, ref: any) => {
      mocks.roots.push(props);
      return ReactModule.createElement("div", { ref, className: props.className }, props.children);
    }),
    Viewport: (props: any) => ReactModule.createElement("section", { className: props.className }, props.children),
    ScrollAreaScrollbar: ReactModule.forwardRef((props: any, ref: any) => {
      mocks.scrollbars.push(props);
      return ReactModule.createElement("aside", { ref, className: props.className }, props.children);
    }),
    ScrollAreaThumb: (props: any) => ReactModule.createElement("span", { className: props.className }),
    Corner: () => ReactModule.createElement("i", null, "corner"),
  };
});

import { ScrollArea, ScrollBar } from "./scroll-area";

describe("ScrollArea", () => {
  it("renders the viewport, default vertical scrollbar, and custom class", () => {
    const html = renderToStaticMarkup(
      React.createElement(ScrollArea, { className: "custom-area" }, "content")
    );

    expect(html).toContain("content");
    expect(html).toContain("corner");
    expect(mocks.roots[0].className).toContain("relative overflow-hidden");
    expect(mocks.roots[0].className).toContain("custom-area");
    expect(mocks.scrollbars[0].orientation).toBe("vertical");
    expect(mocks.scrollbars[0].className).toContain("h-full w-2.5");
  });

  it("renders horizontal scrollbars with horizontal classes", () => {
    renderToStaticMarkup(React.createElement(ScrollBar, { orientation: "horizontal", className: "custom-bar" }));

    expect(mocks.scrollbars.at(-1).orientation).toBe("horizontal");
    expect(mocks.scrollbars.at(-1).className).toContain("h-2.5 flex-col");
    expect(mocks.scrollbars.at(-1).className).toContain("custom-bar");
  });
});
