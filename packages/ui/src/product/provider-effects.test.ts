import type * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const effectMock = vi.hoisted(() => ({
  cleanups: [] as Array<void | (() => void)>,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useEffect: (effect: React.EffectCallback) => {
      effectMock.cleanups.push(effect());
    },
  };
});

import {
  ProductApiAdapterProvider,
  getActiveProductApiAdapter,
  type ProductApiAdapter,
} from "./api-adapter";
import {
  ProductInteractionAdapterProvider,
  getActiveProductInteractionAdapter,
  type ProductInteractionAdapter,
} from "./interactions";

describe("product provider active adapters", () => {
  afterEach(() => {
    effectMock.cleanups = [];
  });

  it("sets and clears the active product API adapter through the provider effect", () => {
    const adapter: ProductApiAdapter = {
      sourceImport: {
        importSource: vi.fn(),
      },
    };

    ProductApiAdapterProvider({ adapter, children: null });

    expect(getActiveProductApiAdapter()).toBe(adapter);
    const cleanup = effectMock.cleanups.pop();
    cleanup?.();
    expect(getActiveProductApiAdapter()).not.toBe(adapter);
  });

  it("sets and clears the active product interaction adapter through the provider effect", () => {
    const adapter: ProductInteractionAdapter = {
      modeChanged: vi.fn(),
    };

    ProductInteractionAdapterProvider({ adapter, children: null });

    expect(getActiveProductInteractionAdapter()).toBe(adapter);
    const cleanup = effectMock.cleanups.pop();
    cleanup?.();
    expect(getActiveProductInteractionAdapter()).not.toBe(adapter);
  });
});
