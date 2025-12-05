// Score Calculation Service
// Integer-based calculations for ZK-friendliness

import type { ScoreInput, ScoreResult, Tier } from '../types/index.js';

/**
 * Calculate agent credit score (0-1000 range)
 * Uses integer arithmetic for ZK compatibility
 */
export function calculateScore(input: ScoreInput): number {
  const { totalTasks, successfulTasks, avgReviewScore, uniqueTaskTypes, daysSinceCreated } = input;

  // Handle edge cases
  if (totalTasks === 0) {
    return 0;
  }

  // Success rate in basis points (0-10000)
  const successRateBp = Math.floor((successfulTasks * 10000) / totalTasks);

  // Average review score in basis points (100-500 for 1-5 scale)
  const avgReviewBp = Math.floor(avgReviewScore * 100);

  // Diversity score (capped at 10)
  const diversityScore = Math.min(uniqueTaskTypes, 10);

  // Age factor in basis points (0-100, reaches max at 90 days)
  const ageFactorBp = Math.min(Math.floor((daysSinceCreated * 100) / 90), 100);

  // Raw score calculation
  // successRateBp (0-10000) * avgReviewBp (100-500) * diversityScore (1-10) * ageFactorBp (0-100)
  // Max theoretical: 10000 * 500 * 10 * 100 = 5,000,000,000
  const raw = successRateBp * avgReviewBp * diversityScore * ageFactorBp;

  // Normalize to 0-1000 range
  const NORMALIZE = 1_000_000;
  const score = Math.floor(raw / NORMALIZE);

  // Cap at 1000
  return Math.min(score, 1000);
}

/**
 * Determine tier based on score and age
 */
export function getTier(score: number, daysSinceCreated: number): Tier {
  if (daysSinceCreated < 30) {
    return 'Bronze';
  }
  if (daysSinceCreated < 90 || score < 300) {
    return 'Silver';
  }
  return 'Gold';
}

/**
 * Calculate score and tier together
 */
export function calculateScoreResult(input: ScoreInput): ScoreResult {
  const score = calculateScore(input);
  const tier = getTier(score, input.daysSinceCreated);
  return { score, tier };
}

/**
 * Calculate average review score from total and count
 * Review scoring: approved = 5 points, changes_requested = 1 point
 */
export function calculateAvgReviewScore(
  totalReviewScore: number,
  totalTasks: number
): number {
  if (totalTasks === 0) {
    return 0;
  }
  // Normalize to 1-5 scale
  const avg = totalReviewScore / totalTasks;
  // Clamp to 1-5 range
  return Math.max(1, Math.min(5, avg));
}
