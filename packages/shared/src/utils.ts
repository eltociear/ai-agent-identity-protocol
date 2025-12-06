/**
 * AI Agent Identity Protocol - Shared Utilities
 *
 * Common utility functions used across frontend and server.
 */

import type { Tier, ScoreInput, ScoreResult, AgentStats } from './types';
import { TIER_THRESHOLDS } from './types';

// =============================================================================
// Date Formatting
// =============================================================================

/**
 * Format Unix timestamp (seconds) to human-readable date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format Unix timestamp to full datetime string
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format timestamp to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return formatDate(timestamp);
}

// =============================================================================
// Score Calculations
// =============================================================================

/**
 * Calculate success rate percentage
 */
export function calculateSuccessRate(stats: AgentStats): number {
  if (stats.totalTasks === 0) return 0;
  return Math.round((stats.successfulTasks / stats.totalTasks) * 100);
}

/**
 * Calculate average review score (1-5 scale)
 */
export function calculateAvgReviewScore(totalReviewScore: number, totalTasks: number): number {
  if (totalTasks === 0) return 0;
  const avg = totalReviewScore / totalTasks;
  return Math.max(1, Math.min(5, avg));
}

/**
 * Format average review score for display
 */
export function formatAvgReviewScore(stats: AgentStats): string {
  if (stats.totalTasks === 0) return '0.0';
  return (stats.totalReviewScore / stats.totalTasks).toFixed(1);
}

/**
 * Determine tier based on score
 */
export function getTierFromScore(score: number): Tier {
  if (score >= TIER_THRESHOLDS.Gold) return 'Gold';
  if (score >= TIER_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
}

/**
 * Calculate agent credit score
 * Weights:
 * - Task volume: 30%
 * - Success rate: 25%
 * - Review quality: 25%
 * - Diversity: 10%
 * - Tenure: 10%
 */
export function calculateScore(input: ScoreInput): ScoreResult {
  const { totalTasks, successfulTasks, avgReviewScore, uniqueTaskTypes, daysSinceCreated } = input;

  // Task volume score (0-300)
  const volumeScore = Math.min(300, totalTasks * 10);

  // Success rate score (0-250)
  const successRate = totalTasks > 0 ? successfulTasks / totalTasks : 0;
  const successScore = successRate * 250;

  // Review quality score (0-250)
  const reviewScore = (avgReviewScore / 5) * 250;

  // Diversity score (0-100)
  const diversityScore = Math.min(100, uniqueTaskTypes * 20);

  // Tenure score (0-100)
  const tenureScore = Math.min(100, daysSinceCreated * 0.5);

  const totalScore = Math.round(volumeScore + successScore + reviewScore + diversityScore + tenureScore);
  const score = Math.min(1000, totalScore);

  return {
    score,
    tier: getTierFromScore(score),
  };
}

// =============================================================================
// String Utilities
// =============================================================================

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, prefixLength = 6, suffixLength = 4): string {
  if (address.length <= prefixLength + suffixLength) return address;
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Extract agent ID from PR body using AAIP-Agent tag
 */
export function extractAgentIdFromBody(body: string | null): { success: boolean; agentId?: string; error?: string } {
  if (!body) {
    return { success: false, error: 'PR body is empty' };
  }

  // Match AAIP-Agent: followed by the agent ID
  const match = body.match(/AAIP-Agent:\s*([^\s\n]+)/i);

  if (!match) {
    return { success: false, error: 'No AAIP-Agent tag found in PR body' };
  }

  return { success: true, agentId: match[1] };
}

/**
 * Format GitHub repo URL
 */
export function formatRepoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

/**
 * Format GitHub PR URL
 */
export function formatPrUrl(repo: string, prNumber: number): string {
  return `https://github.com/${repo}/pull/${prNumber}`;
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate GitHub repo format (owner/repo)
 */
export function isValidGithubRepo(repo: string): boolean {
  return /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo);
}

/**
 * Validate Starknet address format
 */
export function isValidStarknetAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(address);
}
