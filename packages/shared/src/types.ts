/**
 * AI Agent Identity Protocol - Shared Type Definitions
 *
 * This module contains all shared types used across frontend and server.
 * Single source of truth for type definitions.
 */

// =============================================================================
// Core Agent Types
// =============================================================================

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

export interface AgentWithScore {
  agent: Agent;
  stats: AgentStats | null;
  score: ScoreResult | null;
}

// =============================================================================
// Achievement Types
// =============================================================================

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

// =============================================================================
// Tier System
// =============================================================================

export type Tier = 'Bronze' | 'Silver' | 'Gold';

export const TIER_THRESHOLDS = {
  Gold: 800,
  Silver: 500,
  Bronze: 0,
} as const;

// =============================================================================
// Task Types
// =============================================================================

export type TaskType =
  | 'code_review'
  | 'bug_fix'
  | 'feature'
  | 'refactor'
  | 'docs'
  | 'test'
  | 'other';

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  code_review: 'Code Review',
  bug_fix: 'Bug Fix',
  feature: 'Feature',
  refactor: 'Refactor',
  docs: 'Documentation',
  test: 'Testing',
  other: 'Other',
};

// =============================================================================
// MCP Log Types
// =============================================================================

export interface MCPLogPayload {
  agentId: string;
  taskType: string;
  githubRepo: string;
  githubPrNumber: number;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// GitHub Verification Types
// =============================================================================

export type CIStatus = 'success' | 'failure' | 'pending';

export interface GitHubPRInfo {
  repo: string;
  prNumber: number;
  merged: boolean;
  mergedAt: string | null;
  ciStatus: CIStatus;
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

// =============================================================================
// Canonical Task Record (for hashing)
// =============================================================================

export interface CanonicalTaskRecord {
  source: 'github';
  repo: string;
  prNumber: number;
  merged: boolean;
  mergedAt: string | null;
  ciStatus: CIStatus;
  reviews: {
    approvedCount: number;
    changesRequestedCount: number;
  };
  agentId: string;
  agentIdVerified: boolean;
  taskType: string;
  verifiedAt: string;
}

// =============================================================================
// Score Calculation
// =============================================================================

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

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// =============================================================================
// Environment Configuration (Server-only)
// =============================================================================

export interface ServerConfig {
  port: number;
  githubToken: string;
  githubWebhookSecret?: string;
  starknetRpcUrl: string;
  agentRegistryAddress: string;
  achievementRegistryAddress: string;
  serverPrivateKey: string;
}
