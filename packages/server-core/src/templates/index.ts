export type TemplateTab = "default" | "plaza" | "my";

export type TemplateTabParseResult<TTab extends TemplateTab = TemplateTab> =
  | { ok: true; tab: TTab }
  | { ok: false; value: string | null };

export function parseCurrentTemplateTab<TTab extends TemplateTab>(
  value: string | null,
  options: {
    supportedTabs: readonly TTab[];
    defaultTab: TTab;
  }
): TemplateTabParseResult<TTab> {
  const raw = value?.trim() || "";
  if (!raw) return { ok: true, tab: options.defaultTab };
  if ((options.supportedTabs as readonly string[]).includes(raw)) {
    return { ok: true, tab: raw as TTab };
  }
  return { ok: false, value };
}

export function toEngagementCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}
