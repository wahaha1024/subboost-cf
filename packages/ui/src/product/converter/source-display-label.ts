interface BuildSourceDisplayLabelParams {
  typeLabel: string;
  tag?: string;
  order: number;
  total: number;
  orderPlacement?: "prefix" | "suffix";
}

/**
 * 构建导入源标题显示文案：
 * - 优先使用用户自定义 tag
 * - 未设置 tag 时回退到类型默认文案
 * - 多导入源时追加 #序号
 */
export function buildSourceDisplayLabel(params: BuildSourceDisplayLabelParams): string {
  const typeLabel = typeof params.typeLabel === "string" ? params.typeLabel.trim() : "";
  const fallback = typeLabel || "导入源";
  const tag = typeof params.tag === "string" ? params.tag.trim() : "";
  const base = tag || fallback;

  const total = Number.isFinite(params.total) ? Math.floor(params.total) : 0;
  if (total <= 1) return base;

  const order = Number.isFinite(params.order) ? Math.max(1, Math.floor(params.order)) : 1;
  const orderText = `#${order}`;
  return params.orderPlacement === "prefix" ? `${orderText} ${base}` : `${base} ${orderText}`;
}
