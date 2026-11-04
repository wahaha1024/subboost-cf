import { describe, expect, it } from "vitest";
import { SUBBOOST_ICON_PATH } from "./brand";
import { createSubBoostFaviconRedirect } from "./brand-favicon";

describe("SubBoost favicon redirect", () => {
  it("redirects favicon requests to the public app icon", () => {
    const response = createSubBoostFaviconRedirect();

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe(SUBBOOST_ICON_PATH);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=0, must-revalidate");
  });
});
