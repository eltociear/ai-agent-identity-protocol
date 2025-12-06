/**
 * AAIP Frontend Types
 */

// Core Agent Types
export interface Agent {
  agentId: string;
  owner: string;
  name: string;
  metadataUri: string;
  githubRepo: string;
  createdAt: number;
  stakeAmount: string;
  isActive: boolean;
}

export interface Achievement {
  achievementId: string;
  agentId: string;
  taskType: string;
  source: string;
  logHash: string;
  score: number;
  reviewApprovedCount: number;
  reviewChangesRequested: number;
  ciPassed: boolean;
  timestamp: number;
}

export interface AgentStats {
  totalTasks: number;
  successfulTasks: number;
  totalReviewScore: number;
  uniqueTaskTypes: number;
  lastActivity: number;
}

// Tier System
export type Tier = 'Bronze' | 'Silver' | 'Gold';

export interface ScoreResult {
  score: number;
  tier: Tier;
}

export interface AgentWithScore {
  agent: Agent;
  stats: AgentStats | null;
  score: ScoreResult | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
