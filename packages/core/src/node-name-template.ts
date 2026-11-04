export const DEFAULT_NODE_NAME_TEMPLATE = "[{tag}]{name}";

export function formatNodeNameFromTemplate(params: {
  originName: string;
  tag?: string;
  template?: string;
}): string {
  const originName = params.originName.trim();
  if (!originName) return "";

  const tag = typeof params.tag === "string" ? params.tag.trim() : "";
  if (!tag) return originName;

  const template = typeof params.template === "string" ? params.template.trim() : "";
  const pattern = template || DEFAULT_NODE_NAME_TEMPLATE;

  const formatted = pattern.replaceAll("{tag}", tag).replaceAll("{name}", originName).trim();
  return formatted || originName;
}

/**
 * 机场常把测速快照拼进节点名，例如 "HK 移动优选[63ms 21.18Mbps]"。
 * 这类数字每次订阅刷新都变，客户端保存的“选中节点”会因名字失配而全部退回默认。
 * 这里统一剥离方括号里的延迟/带宽快照，其余内容原样保留。
 */
const SPEED_SNAPSHOT_BRACKET_PATTERN = /[\s\u3000]*[\[［]([^\]］]*)[\]］]/g;
const SPEED_SNAPSHOT_TOKEN_PATTERN = /(\d+(?:\.\d+)?\s*(?:ms|MS|Ms|Mbps|mbps|MB\/s|KB\/s|m\/s))|(?:延迟|速度)/i;

export function stripSpeedSnapshotFromNodeName(name: string): string {
  const raw = typeof name === "string" ? name : "";
  if (!raw.includes("[") && !raw.includes("［")) return raw.trim();

  let changed = true;
  let current = raw;
  while (changed) {
    changed = false;
    current = current.replace(SPEED_SNAPSHOT_BRACKET_PATTERN, (match: string, inner: string) => {
      if (!SPEED_SNAPSHOT_TOKEN_PATTERN.test(inner)) return match;
      changed = true;
      return "";
    });
  }

  const trimmed = current.trim();
  return trimmed || raw.trim();
}
