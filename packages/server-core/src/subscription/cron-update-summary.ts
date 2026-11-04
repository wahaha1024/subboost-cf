export type CronSubscriptionUpdateSummary = {
  subscriptionId: string;
  subscriptionName: string;
  userId: string;
  username: string | null;
  hosts: string[];
  nodeCount?: number;
  error?: string;
};

export type CronUpdatedUserSummary = {
  userId: string;
  username: string | null;
  count: number;
};

export type CronHostSummary = {
  host: string;
  count: number;
};

export type CronUpdateResults = {
  total: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
};

export type CronUpdateOutcome =
  | {
      status: "updated";
      requestedHosts: string[];
      recordHosts: true;
      updatedSubscription: CronSubscriptionUpdateSummary;
    }
  | {
      status: "failed";
      requestedHosts: string[];
      recordHosts: boolean;
      resultsError: string;
      failedSubscription?: CronSubscriptionUpdateSummary;
    }
  | {
      status: "skipped";
      requestedHosts: string[];
      recordHosts: false;
    };

export type CronUpdateAccumulator = {
  results: CronUpdateResults;
  updatedSubscriptions: CronSubscriptionUpdateSummary[];
  failedSubscriptions: CronSubscriptionUpdateSummary[];
  hostCounts: Map<string, number>;
  updatedUserCounts: Map<string, CronUpdatedUserSummary>;
};

export type FinalCronUpdateSummary = {
  results: CronUpdateResults;
  updatedSubscriptions: CronSubscriptionUpdateSummary[];
  failedSubscriptions: CronSubscriptionUpdateSummary[];
  updatedUsers: CronUpdatedUserSummary[];
  topHosts: CronHostSummary[];
};

export function extractHostsFromSubscriptionUrls(list: readonly unknown[]): string[] {
  const hosts = new Set<string>();

  for (const raw of list) {
    const url = typeof raw === "string" ? raw.trim() : "";
    if (!url) continue;

    try {
      hosts.add(new URL(url).host);
    } catch {
      // Ignore malformed saved sources; refresh diagnostics handle source failures elsewhere.
    }
  }

  return Array.from(hosts).sort();
}

export function createCronUpdateAccumulator(total: number): CronUpdateAccumulator {
  return {
    results: {
      total,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    },
    updatedSubscriptions: [],
    failedSubscriptions: [],
    hostCounts: new Map(),
    updatedUserCounts: new Map(),
  };
}

export function recordSubscriptionHosts(hostCounts: Map<string, number>, hosts: readonly string[]): void {
  for (const host of hosts) {
    hostCounts.set(host, (hostCounts.get(host) || 0) + 1);
  }
}

export function recordUpdatedSubscriptionUser(
  updatedUserCounts: Map<string, CronUpdatedUserSummary>,
  userId: string,
  username: string | null
): void {
  const existing = updatedUserCounts.get(userId);
  if (existing) {
    existing.count += 1;
    if (!existing.username && username) existing.username = username;
    return;
  }

  updatedUserCounts.set(userId, { userId, username, count: 1 });
}

export function applyCronUpdateOutcome(accumulator: CronUpdateAccumulator, outcome: CronUpdateOutcome): void {
  if (outcome.status === "updated") {
    accumulator.results.updated += 1;
    accumulator.updatedSubscriptions.push(outcome.updatedSubscription);
    recordUpdatedSubscriptionUser(
      accumulator.updatedUserCounts,
      outcome.updatedSubscription.userId,
      outcome.updatedSubscription.username
    );
  } else if (outcome.status === "failed") {
    accumulator.results.failed += 1;
    accumulator.results.errors.push(outcome.resultsError);
    if (outcome.failedSubscription) {
      accumulator.failedSubscriptions.push(outcome.failedSubscription);
    }
  } else {
    accumulator.results.skipped += 1;
  }

  if (outcome.recordHosts) {
    recordSubscriptionHosts(accumulator.hostCounts, outcome.requestedHosts);
  }
}

export function recordCronUpdateSkipped(accumulator: CronUpdateAccumulator): void {
  accumulator.results.skipped += 1;
}

export function toTopUpdatedUsers(
  updatedUserCounts: ReadonlyMap<string, CronUpdatedUserSummary>,
  max: number
): CronUpdatedUserSummary[] {
  return Array.from(updatedUserCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, max);
}

export function toTopHostSummaries(hostCounts: ReadonlyMap<string, number>, max: number): CronHostSummary[] {
  return Array.from(hostCounts.entries())
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, max);
}

export function finalizeCronUpdateSummary(
  accumulator: CronUpdateAccumulator,
  options: { maxTopHosts: number; maxTopUsers: number }
): FinalCronUpdateSummary {
  return {
    results: accumulator.results,
    updatedSubscriptions: accumulator.updatedSubscriptions,
    failedSubscriptions: accumulator.failedSubscriptions,
    updatedUsers: toTopUpdatedUsers(accumulator.updatedUserCounts, options.maxTopUsers),
    topHosts: toTopHostSummaries(accumulator.hostCounts, options.maxTopHosts),
  };
}

export function buildCronUpdateResponseBody(
  results: CronUpdateResults,
  timestamp: Date = new Date()
): { success: true; results: CronUpdateResults; timestamp: string } {
  return {
    success: true,
    results,
    timestamp: timestamp.toISOString(),
  };
}
