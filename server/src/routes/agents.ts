// Agent Routes
import { Hono } from 'hono';
import {
  getAgent,
  getAgentByRepo,
  getAgentCount,
  getAgentAgeDays,
  getAgentStats,
  getAchievementsByAgent,
} from '../services/starknet.js';
import { calculateScoreResult, calculateAvgReviewScore } from '../services/score.js';
import { successResponse, errors } from '../utils/response.js';
import type { ScoreResult } from '../types/index.js';

const agents = new Hono();

// GET /api/agents - List all agents (with count)
agents.get('/', async (c) => {
  const count = await getAgentCount();

  if (count === null) {
    return errors.serverError(c, 'Failed to fetch agent count');
  }

  return successResponse(c, { count });
});

// GET /api/agents/:id - Get agent details with score
agents.get('/:id', async (c) => {
  const agentId = c.req.param('id');

  const agent = await getAgent(agentId);
  if (!agent) {
    return errors.notFound(c, 'Agent');
  }

  // Get stats and calculate score
  const stats = await getAgentStats(agentId);
  const ageDays = await getAgentAgeDays(agentId);

  let scoreResult: ScoreResult | null = null;
  if (stats && ageDays !== null) {
    const avgReviewScore = calculateAvgReviewScore(stats.totalReviewScore, stats.totalTasks);
    scoreResult = calculateScoreResult({
      totalTasks: stats.totalTasks,
      successfulTasks: stats.successfulTasks,
      avgReviewScore,
      uniqueTaskTypes: stats.uniqueTaskTypes,
      daysSinceCreated: ageDays,
    });
  }

  return successResponse(c, { agent, stats, score: scoreResult });
});

// GET /api/agents/:id/achievements - Get agent achievements
agents.get('/:id/achievements', async (c) => {
  const agentId = c.req.param('id');
  const offset = parseInt(c.req.query('offset') ?? '0', 10);
  const limit = parseInt(c.req.query('limit') ?? '10', 10);

  // Validate pagination params
  if (isNaN(offset) || offset < 0) {
    return errors.badRequest(c, 'Invalid offset');
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return errors.badRequest(c, 'Invalid limit (must be 1-100)');
  }

  const achievements = await getAchievementsByAgent(agentId, offset, limit);

  return successResponse(c, { achievements, offset, limit });
});

// GET /api/agents/by-repo/:owner/:repo - Get agent by GitHub repo
agents.get('/by-repo/:owner/:repo', async (c) => {
  const owner = c.req.param('owner');
  const repo = c.req.param('repo');
  const repoString = `${owner}/${repo}`;

  const agentId = await getAgentByRepo(repoString);
  if (!agentId) {
    return errors.notFound(c, 'Agent for this repository');
  }

  // Redirect to agent details
  return c.redirect(`/api/agents/${agentId}`);
});

export default agents;
