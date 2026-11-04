import { formatInBeijing } from "@subboost/core/time/beijing";

export function formatDashboardDate(dateString: string | null): string {
  if (!dateString) return "从未";
  return formatInBeijing(
    dateString,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    "从未"
  );
}

export function formatIntervalLabel(seconds: number): string {
  if (seconds <= 0) return "0 秒";
  const day = 86400;
  const hour = 3600;
  const minute = 60;
  if (seconds % day === 0) return `${seconds / day} 天`;
  if (seconds % hour === 0) return `${seconds / hour} 小时`;
  if (seconds % minute === 0) return `${seconds / minute} 分钟`;
  return `${seconds} 秒`;
}
