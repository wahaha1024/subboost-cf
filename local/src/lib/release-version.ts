const STABLE_VERSION_PATTERN = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export type StableVersion = {
  major: number;
  minor: number;
  patch: number;
  version: string;
};

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function parseStableVersion(value: unknown): StableVersion | null {
  const normalized = readString(value);
  const match = normalized ? STABLE_VERSION_PATTERN.exec(normalized) : null;
  if (!match) return null;

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  return {
    major,
    minor,
    patch,
    version: `${major}.${minor}.${patch}`,
  };
}

export function compareStableVersions(left: StableVersion, right: StableVersion): number {
  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  return left.patch - right.patch;
}
