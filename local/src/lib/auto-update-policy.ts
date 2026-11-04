import type { AutoUpdateIntervalPolicyOverride } from "@subboost/core/subscription/auto-update-interval";

export const LOCAL_AUTO_UPDATE_DEFAULT_HOURS = 12;
export const LOCAL_AUTO_UPDATE_MIN_HOURS = 0.1;
export const LOCAL_AUTO_UPDATE_STEP_HOURS = 0.1;
export const LOCAL_AUTO_UPDATE_MIN_SECONDS = Math.round(LOCAL_AUTO_UPDATE_MIN_HOURS * 60 * 60);

export const LOCAL_AUTO_UPDATE_POLICY = {
  defaultHours: LOCAL_AUTO_UPDATE_DEFAULT_HOURS,
  minHours: LOCAL_AUTO_UPDATE_MIN_HOURS,
  stepHours: LOCAL_AUTO_UPDATE_STEP_HOURS,
  requireIntegerHours: false,
} satisfies AutoUpdateIntervalPolicyOverride;

export function normalizeLocalAutoUpdateIntervalSeconds(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  if (!Number.isInteger(numeric)) {
    throw new Error("自动更新间隔必须是整数（秒）");
  }
  if (numeric < LOCAL_AUTO_UPDATE_MIN_SECONDS) {
    throw new Error("自动更新最小间隔为 0.1 小时");
  }
  return numeric;
}
