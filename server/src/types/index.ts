// AI Agent Identity Protocol - Type Definitions

// Agent types
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

export interface AgentRegistration {
  name: string;
  metadataUri: string;
  githubRepo: string;
}

// Achievement types
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

// Tier system
export type Tier = 'Bronze' | 'Silver' | 'Gold';

// MCP Log types
export interface MCPLogPayload {
  agentId: string;
  taskType: string;
  githubRepo: string;
  githubPrNumber: number;
  metadata?: Record<string, unknown>;
}

// GitHub verification types
export interface GitHubPRInfo {
  repo: string;
  prNumber: number;
  merged: boolean;
  mergedAt: string | null;
  ciStatus: 'success' | 'failure' | 'pending';
  reviews: {
    approvedCount: number;
    changesRequestedCount: number;
  };
  body: string | null;
}

export interface AgentIdExtraction {
  success: boolean;
  agentId?: string;
  error?: string;
}

// Canonical Task Record (for hashing)
export interface CanonicalTaskRecord {
  source: 'github';
  repo: string;
  prNumber: number;
  merged: boolean;
  mergedAt: string | null;
  ciStatus: 'success' | 'failure' | 'pending';
  reviews: {
    approvedCount: number;
    changesRequestedCount: number;
  };
  agentId: string;
  agentIdVerified: boolean;
  taskType: string;
  verifiedAt: string;
}

// Score calculation
export interface ScoreInput {
  totalTasks: number;
  successfulTasks: number;
  avgReviewScore: number;
  uniqueTaskTypes: number;
  daysSinceCreated: number;
}

export interface ScoreResult {
  score: number;
  tier: Tier;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Environment configuration
export interface Config {
  port: number;
  githubToken: string;
  starknetRpcUrl: string;
  agentRegistryAddress: string;
  achievementRegistryAddress: string;
  serverPrivateKey: string;
}
