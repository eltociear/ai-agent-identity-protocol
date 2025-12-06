/**
 * Frontend Utilities
 *
 * Common utility functions for the frontend.
 */

import type { AgentStats } from '@/types';

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
 * Format average review score for display
 */
export function formatAvgReviewScore(stats: AgentStats): string {
  if (stats.totalTasks === 0) return '0.0';
  return (stats.totalReviewScore / stats.totalTasks).toFixed(1);
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
 * Format GitHub repo URL
 */
export function formatRepoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}
