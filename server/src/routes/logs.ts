// MCP Log Routes
import { Hono } from 'hono';
import { z } from 'zod';
import { getPRInfo, extractAgentIdFromPRBody } from '../services/github.js';
import { getAgentByRepo, addAchievement } from '../services/starknet.js';
import { createCanonicalRecord, computeLogHash, computeAchievementScore } from '../utils/hash.js';
import type { ApiResponse, CanonicalTaskRecord } from '../types/index.js';

const logs = new Hono();

// Request validation schema
const MCPLogSchema = z.object({
  agentId: z.string().min(1),
  taskType: z.string().min(1),
  githubRepo: z.string().regex(/^[^\/]+\/[^\/]+$/, 'Must be in owner/repo format'),
  githubPrNumber: z.number().int().positive(),
  metadata: z.record(z.unknown()).optional(),
});

// POST /api/logs - Receive and process MCP logs
logs.post('/', async (c) => {
  // Parse and validate request body
  let payload;
  try {
    const body = await c.req.json();
    payload = MCPLogSchema.parse(body);
  } catch (error) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Invalid request body',
    }, 400);
  }

  const { agentId, taskType, githubRepo, githubPrNumber } = payload;

  // Step 1: Verify agent exists and is bound to this repo
  const registeredAgentId = await getAgentByRepo(githubRepo);
  if (!registeredAgentId) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: `No agent registered for repository: ${githubRepo}`,
    }, 404);
  }

  if (registeredAgentId !== agentId) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: `Agent ID mismatch: expected ${registeredAgentId}, got ${agentId}`,
    }, 403);
  }

  // Step 2: Get and verify PR info from GitHub
  const prInfo = await getPRInfo(githubRepo, githubPrNumber);
  if (!prInfo) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to fetch PR information from GitHub',
    }, 502);
  }

  // Step 3: Verify agent ID in PR body
  const extraction = extractAgentIdFromPRBody(prInfo.body);
  if (!extraction.success) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: `PR body verification failed: ${extraction.error}`,
    }, 400);
  }

  if (extraction.agentId !== agentId) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: `Agent ID in PR body (${extraction.agentId}) does not match claimed agent (${agentId})`,
    }, 403);
  }

  // Step 4: Check if PR is merged (required for achievement)
  if (!prInfo.merged) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'PR is not merged yet. Achievements are only recorded for merged PRs.',
    }, 400);
  }

  // Step 5: Create canonical record and compute hash
  const canonicalRecord = createCanonicalRecord(
    githubRepo,
    githubPrNumber,
    prInfo.merged,
    prInfo.mergedAt,
    prInfo.ciStatus,
    prInfo.reviews.approvedCount,
    prInfo.reviews.changesRequestedCount,
    agentId,
    taskType
  );

  const logHash = computeLogHash(canonicalRecord);

  // Step 6: Compute achievement score
  const ciPassed = prInfo.ciStatus === 'success';
  const score = computeAchievementScore(
    ciPassed,
    prInfo.reviews.approvedCount,
    prInfo.reviews.changesRequestedCount
  );

  // Step 7: Submit achievement to Starknet
  const achievementId = await addAchievement(
    agentId,
    taskType,
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
      error: 'Failed to submit achievement to blockchain',
    }, 500);
  }

  return c.json<ApiResponse<{
    achievementId: string;
    logHash: string;
    score: number;
    canonicalRecord: CanonicalTaskRecord;
  }>>({
    success: true,
    data: {
      achievementId,
      logHash,
      score,
      canonicalRecord,
    },
  });
});

// POST /api/logs/verify - Verify a PR without recording (dry run)
logs.post('/verify', async (c) => {
  let payload;
  try {
    const body = await c.req.json();
    payload = MCPLogSchema.parse(body);
  } catch (error) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Invalid request body',
    }, 400);
  }

  const { agentId, githubRepo, githubPrNumber } = payload;

  // Get PR info
  const prInfo = await getPRInfo(githubRepo, githubPrNumber);
  if (!prInfo) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to fetch PR information',
    }, 502);
  }

  // Extract and verify agent ID
  const extraction = extractAgentIdFromPRBody(prInfo.body);

  // Check repo binding
  const registeredAgentId = await getAgentByRepo(githubRepo);

  // Compute what the score would be
  const ciPassed = prInfo.ciStatus === 'success';
  const score = computeAchievementScore(
    ciPassed,
    prInfo.reviews.approvedCount,
    prInfo.reviews.changesRequestedCount
  );

  return c.json<ApiResponse<{
    prInfo: typeof prInfo;
    agentIdExtraction: typeof extraction;
    registeredAgentId: string | null;
    wouldBeValid: boolean;
    wouldScore: number;
    issues: string[];
  }>>({
    success: true,
    data: {
      prInfo,
      agentIdExtraction: extraction,
      registeredAgentId,
      wouldBeValid: extraction.success &&
                    extraction.agentId === agentId &&
                    registeredAgentId === agentId &&
                    prInfo.merged,
      wouldScore: score,
      issues: [
        !extraction.success ? extraction.error : null,
        extraction.agentId !== agentId ? `Agent ID mismatch in PR body` : null,
        registeredAgentId !== agentId ? `Agent not registered for this repo` : null,
        !prInfo.merged ? 'PR not merged' : null,
      ].filter((i): i is string => i !== null),
    },
  });
});

export default logs;
