function countryCodeToFlagEmoji(countryCode: string): string | null {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  const A = 0x1f1e6;
  const first = A + (code.charCodeAt(0) - 65);
  const second = A + (code.charCodeAt(1) - 65);
  return String.fromCodePoint(first, second);
}

function isFlagEmoji(token: string): boolean {
  // Flag emoji consists of two Regional Indicator Symbols (each is a surrogate pair => length 4 in UTF-16)
  if (token.length !== 4) return false;
  const first = token.codePointAt(0);
  const second = token.codePointAt(2);
  if (!first || !second) return false;
  const inRange = (cp: number) => cp >= 0x1f1e6 && cp <= 0x1f1ff;
  return inRange(first) && inRange(second);
}

export function getDialerEmojiFromName(name: string): string {
  const token = name.trim().split(/\s+/)[0] || "";
  if (!token) return "🔗";
  if (isFlagEmoji(token)) return token;
  return countryCodeToFlagEmoji(token) ?? "🔗";
}

