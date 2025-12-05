// GitHub Webhook Routes
import { Hono } from 'hono';
import { getPRInfo, extractAgentIdFromPRBody } from '../services/github.js';
import { getAgentByRepo, addAchievement } from '../services/starknet.js';
import { createCanonicalRecord, computeLogHash, computeAchievementScore } from '../utils/hash.js';
import type { ApiResponse } from '../types/index.js';

const webhooks = new Hono();

// GitHub webhook event types we handle
interface GitHubPullRequestEvent {
  action: string;
  pull_request: {
    number: number;
    merged: boolean;
    merged_at: string | null;
    body: string | null;
    base: {
      repo: {
        full_name: string;
      };
    };
  };
  repository: {
    full_name: string;
  };
}

// POST /api/webhooks/github - GitHub webhook endpoint
webhooks.post('/github', async (c) => {
  const event = c.req.header('X-GitHub-Event');

  // Only process pull_request events
  if (event !== 'pull_request') {
    return c.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: `Ignored event type: ${event}` },
    });
  }

  let payload: GitHubPullRequestEvent;
  try {
    payload = await c.req.json();
  } catch {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Invalid JSON payload',
    }, 400);
  }

  // Only process closed (merged) PRs
  if (payload.action !== 'closed' || !payload.pull_request.merged) {
    return c.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: 'Ignored: PR not merged' },
    });
  }

  const prNumber = payload.pull_request.number;
  const repoFullName = payload.repository.full_name;
  const prBody = payload.pull_request.body;

  // Check if this repo has a registered agent
  const registeredAgentId = await getAgentByRepo(repoFullName);
  if (!registeredAgentId) {
    return c.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: `No agent registered for repo: ${repoFullName}` },
    });
  }

  // Extract agent ID from PR body
  const extraction = extractAgentIdFromPRBody(prBody);
  if (!extraction.success || !extraction.agentId) {
    return c.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: `No AAIP-Agent tag in PR body: ${extraction.error}` },
    });
  }

  // Verify agent ID matches registered agent
  if (extraction.agentId !== registeredAgentId) {
    return c.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: `Agent ID mismatch: PR has ${extraction.agentId}, repo registered to ${registeredAgentId}` },
    });
  }

  // Fetch full PR info for CI status and reviews
  const prInfo = await getPRInfo(repoFullName, prNumber);
  if (!prInfo) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to fetch PR details from GitHub API',
    }, 502);
  }

  // Create canonical record
  const canonicalRecord = createCanonicalRecord(
    repoFullName,
    prNumber,
    prInfo.merged,
    prInfo.mergedAt,
    prInfo.ciStatus,
    prInfo.reviews.approvedCount,
    prInfo.reviews.changesRequestedCount,
    extraction.agentId,
    'github_pr_merged'
  );

  const logHash = computeLogHash(canonicalRecord);

  // Compute score
  const ciPassed = prInfo.ciStatus === 'success';
  const score = computeAchievementScore(
    ciPassed,
    prInfo.reviews.approvedCount,
    prInfo.reviews.changesRequestedCount
  );

  // Submit to blockchain
  const achievementId = await addAchievement(
    extraction.agentId,
    'github_pr_merged',
    'github',
    logHash,
    score,
    prInfo.reviews.approvedCount,
    prInfo.reviews.changesRequestedCount,
    ciPassed
  );

  if (!achievementId) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to record achievement on-chain',
    }, 500);
  }

  return c.json<ApiResponse<{
    message: string;
    achievementId: string;
    score: number;
  }>>({
    success: true,
    data: {
      message: 'Achievement recorded',
      achievementId,
      score,
    },
  });
});

export default webhooks;
