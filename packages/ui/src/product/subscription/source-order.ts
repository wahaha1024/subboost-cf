import type { SubscriptionSource } from "@subboost/ui/store/config-store";

export type SourceOrderDirection = "up" | "down";

export function moveSubscriptionSource(
  sources: SubscriptionSource[],
  sourceId: string,
  direction: SourceOrderDirection
): SubscriptionSource[] {
  const currentIndex = sources.findIndex((source) => source.id === sourceId);
  if (currentIndex < 0) return sources;

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= sources.length) return sources;

  const nextSources = [...sources];
  [nextSources[currentIndex], nextSources[targetIndex]] = [nextSources[targetIndex], nextSources[currentIndex]];
  return nextSources;
}
