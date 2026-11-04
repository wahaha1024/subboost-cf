import { describe, expect, it } from "vitest";
import {
  CONFIG_DRAFT_GUEST_STORAGE_NAME,
  getConfigDraftStorageNameForUser,
} from "@subboost/ui/store/config-store/draft-storage";

describe("config draft storage", () => {
  it("maps anonymous users to guest scope and encoded users to user scope", () => {
    expect(getConfigDraftStorageNameForUser(null)).toBe(CONFIG_DRAFT_GUEST_STORAGE_NAME);
    expect(getConfigDraftStorageNameForUser("")).toBe(CONFIG_DRAFT_GUEST_STORAGE_NAME);
    expect(getConfigDraftStorageNameForUser(" user a ")).toBe("subboost-config:user:user%20a");
  });
});
