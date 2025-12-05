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
import type { ApiResponse, ScoreResult } from '../types/index.js';

const agents = new Hono();

// GET /api/agents - List all agents (with count)
agents.get('/', async (c) => {
  const count = await getAgentCount();

  if (count === null) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to fetch agent count',
    }, 500);
  }

  return c.json<ApiResponse<{ count: number }>>({
    success: true,
    data: { count },
  });
});

// GET /api/agents/:id - Get agent details with score
agents.get('/:id', async (c) => {
  const agentId = c.req.param('id');

  const agent = await getAgent(agentId);
  if (!agent) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Agent not found',
    }, 404);
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

  return c.json<ApiResponse<{
    agent: typeof agent;
    stats: typeof stats;
    score: ScoreResult | null;
  }>>({
    success: true,
    data: {
      agent,
      stats,
      score: scoreResult,
    },
  });
});

// GET /api/agents/:id/achievements - Get agent achievements
agents.get('/:id/achievements', async (c) => {
  const agentId = c.req.param('id');
  const offset = parseInt(c.req.query('offset') ?? '0', 10);
  const limit = parseInt(c.req.query('limit') ?? '10', 10);

  // Validate pagination params
  if (isNaN(offset) || offset < 0) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Invalid offset',
    }, 400);
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Invalid limit (must be 1-100)',
    }, 400);
  }

  const achievements = await getAchievementsByAgent(agentId, offset, limit);

  return c.json<ApiResponse<{ achievements: typeof achievements; offset: number; limit: number }>>({
    success: true,
    data: {
      achievements,
      offset,
      limit,
    },
  });
});

// GET /api/agents/by-repo/:owner/:repo - Get agent by GitHub repo
agents.get('/by-repo/:owner/:repo', async (c) => {
  const owner = c.req.param('owner');
  const repo = c.req.param('repo');
  const repoString = `${owner}/${repo}`;

  const agentId = await getAgentByRepo(repoString);
  if (!agentId) {
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'No agent registered for this repository',
    }, 404);
  }

  // Redirect to agent details
  return c.redirect(`/api/agents/${agentId}`);
});

export default agents;
