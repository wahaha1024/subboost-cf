import type { ParsedNode } from "@subboost/core/types/node";
import {
  resolveSubscriptionUserInfo,
  type SubscriptionUserInfo,
} from "@subboost/core/subscription/subscription-userinfo";

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const decimals = i === 0 ? 0 : value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(decimals)} ${units[i]}`;
}

function formatExpireDate(expireSeconds: number): string {
  if (!Number.isFinite(expireSeconds) || expireSeconds <= 0) return "-";
  const d = new Date(expireSeconds * 1000);
  if (Number.isNaN(d.getTime())) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getSubscriptionUserInfoDisplay(
  info?: SubscriptionUserInfo,
  nodes: ParsedNode[] = []
): { traffic: string | null; expire: string | null } {
  const safeInfo = resolveSubscriptionUserInfo(info, nodes);
  const upload = typeof safeInfo.upload === "number" && Number.isFinite(safeInfo.upload) ? safeInfo.upload : 0;
  const download = typeof safeInfo.download === "number" && Number.isFinite(safeInfo.download) ? safeInfo.download : 0;
  const used = upload + download;

  const traffic = (() => {
    const total = safeInfo.total;
    if (typeof total === "number" && Number.isFinite(total) && total > 0) {
      return `${formatBytes(used)}/${formatBytes(total)}`;
    }
    return used > 0 ? formatBytes(used) : null;
  })();

  const expireFromHeader =
    typeof safeInfo.expire === "number" && Number.isFinite(safeInfo.expire) && safeInfo.expire > 946684800
      ? formatExpireDate(safeInfo.expire)
      : null;
  const expire = expireFromHeader || null;

  return { traffic, expire };
}
