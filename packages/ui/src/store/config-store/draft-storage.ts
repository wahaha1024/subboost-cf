export const CONFIG_DRAFT_STORAGE_PREFIX = "subboost-config";
export const CONFIG_DRAFT_GUEST_STORAGE_NAME = `${CONFIG_DRAFT_STORAGE_PREFIX}:guest`;

export function getConfigDraftStorageNameForUser(userId: string | null | undefined): string {
  const normalizedUserId = typeof userId === "string" ? userId.trim() : "";
  if (!normalizedUserId) return CONFIG_DRAFT_GUEST_STORAGE_NAME;
  return `${CONFIG_DRAFT_STORAGE_PREFIX}:user:${encodeURIComponent(normalizedUserId)}`;
}
