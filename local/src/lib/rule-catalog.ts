import "server-only";

import { createRuleCatalogService } from "@subboost/server-core/rules";

export const localRuleCatalogService = createRuleCatalogService({
  getGitHubToken: () => process.env.GITHUB_TOKEN,
  logger: console,
});

export const searchRules = localRuleCatalogService.searchRules;
export const refreshRuleIndex = localRuleCatalogService.refreshRuleIndex;
export const getCnRuleCandidateDiscovery = localRuleCatalogService.getCnRuleCandidateDiscovery;
