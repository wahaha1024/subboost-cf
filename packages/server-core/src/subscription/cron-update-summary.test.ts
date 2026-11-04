import { describe, expect, it } from "vitest";
import {
  applyCronUpdateOutcome,
  buildCronUpdateResponseBody,
  createCronUpdateAccumulator,
  extractHostsFromSubscriptionUrls,
  finalizeCronUpdateSummary,
  recordSubscriptionHosts,
  recordUpdatedSubscriptionUser,
  toTopHostSummaries,
  toTopUpdatedUsers,
  type CronUpdatedUserSummary,
} from "./cron-update-summary";

describe("cron update summary helpers", () => {
  it("extracts sorted unique hosts from saved URL sources", () => {
    expect(
      extractHostsFromSubscriptionUrls([
        " https://b.example/sub ",
        "not a url",
        "",
        "https://a.example:8443/path",
        "https://b.example/other",
        null,
      ])
    ).toEqual(["a.example:8443", "b.example"]);
  });

  it("records host counts and returns the top hosts", () => {
    const hostCounts = new Map<string, number>();

    recordSubscriptionHosts(hostCounts, ["b.example", "a.example"]);
    recordSubscriptionHosts(hostCounts, ["a.example", "c.example"]);

    expect(toTopHostSummaries(hostCounts, 2)).toEqual([
      { host: "a.example", count: 2 },
      { host: "b.example", count: 1 },
    ]);
  });

  it("records updated users and backfills a missing username", () => {
    const updatedUserCounts = new Map<string, CronUpdatedUserSummary>();

    recordUpdatedSubscriptionUser(updatedUserCounts, "user-1", null);
    recordUpdatedSubscriptionUser(updatedUserCounts, "user-2", "bob");
    recordUpdatedSubscriptionUser(updatedUserCounts, "user-1", "alice");

    expect(toTopUpdatedUsers(updatedUserCounts, 1)).toEqual([{ userId: "user-1", username: "alice", count: 2 }]);
  });

  it("applies update, skipped, and failure outcomes to the accumulator", () => {
    const accumulator = createCronUpdateAccumulator(4);

    applyCronUpdateOutcome(accumulator, {
      status: "updated",
      requestedHosts: ["a.example"],
      recordHosts: true,
      updatedSubscription: {
        subscriptionId: "sub-1",
        subscriptionName: "A",
        userId: "user-1",
        username: null,
        hosts: ["a.example"],
        nodeCount: 3,
      },
    });
    applyCronUpdateOutcome(accumulator, {
      status: "failed",
      requestedHosts: ["b.example"],
      recordHosts: true,
      resultsError: "Subscription sub-2: failed",
      failedSubscription: {
        subscriptionId: "sub-2",
        subscriptionName: "B",
        userId: "user-2",
        username: "bob",
        hosts: ["b.example"],
        error: "failed",
      },
    });
    applyCronUpdateOutcome(accumulator, {
      status: "skipped",
      requestedHosts: [],
      recordHosts: false,
    });

    const finalized = finalizeCronUpdateSummary(accumulator, { maxTopHosts: 5, maxTopUsers: 5 });
    expect(finalized.results).toEqual({
      total: 4,
      updated: 1,
      skipped: 1,
      failed: 1,
      errors: ["Subscription sub-2: failed"],
    });
    expect(finalized.updatedUsers).toEqual([{ userId: "user-1", username: null, count: 1 }]);
    expect(finalized.topHosts).toEqual([
      { host: "a.example", count: 1 },
      { host: "b.example", count: 1 },
    ]);
    expect(finalized.updatedSubscriptions).toHaveLength(1);
    expect(finalized.failedSubscriptions).toHaveLength(1);
  });

  it("builds the public cron response body with a stable timestamp", () => {
    const results = createCronUpdateAccumulator(0).results;

    expect(buildCronUpdateResponseBody(results, new Date("2026-05-31T00:00:00.000Z"))).toEqual({
      success: true,
      results,
      timestamp: "2026-05-31T00:00:00.000Z",
    });
  });
});
