// Hash utilities for canonical record creation
import { keccak256, toUtf8Bytes } from 'ethers';
import type { CanonicalTaskRecord } from '../types/index.js';

/**
 * Create a canonical task record from verification results
 */
export function createCanonicalRecord(
  repo: string,
  prNumber: number,
  merged: boolean,
  mergedAt: string | null,
  ciStatus: 'success' | 'failure' | 'pending',
  approvedCount: number,
  changesRequestedCount: number,
  agentId: string,
  taskType: string
): CanonicalTaskRecord {
  return {
    source: 'github',
    repo,
    prNumber,
    merged,
    mergedAt,
    ciStatus,
    reviews: {
      approvedCount,
      changesRequestedCount,
    },
    agentId,
    agentIdVerified: true,
    taskType,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Compute keccak256 hash of a canonical record
 * Produces a felt252-compatible hash (252 bits max)
 */
export function computeLogHash(record: CanonicalTaskRecord): string {
  // Sort keys for deterministic ordering
  const sortedKeys = Object.keys(record).sort();
  const sortedRecord: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    sortedRecord[key] = record[key as keyof CanonicalTaskRecord];
  }

  const json = JSON.stringify(sortedRecord);
  const hash = keccak256(toUtf8Bytes(json));

  // Truncate to 252 bits (felt252 compatible) by masking
  // felt252 max is 2^252 - 1, so we mask the top 4 bits
  const hashBigInt = BigInt(hash);
  const felt252Max = (BigInt(1) << BigInt(252)) - BigInt(1);
  const truncated = hashBigInt & felt252Max;

  return '0x' + truncated.toString(16);
}

/**
 * Compute score for an achievement based on PR info
 * Score is 0-100 based on CI status and reviews
 */
export function computeAchievementScore(
  ciPassed: boolean,
  approvedCount: number,
  changesRequestedCount: number
): number {
  let score = 0;

  // Base score for merged PR
  score += 50;

  // CI bonus
  if (ciPassed) {
    score += 25;
  }

  // Review bonus (up to 25 points)
  // Each approval adds 10 points, each changes_requested subtracts 5
  const reviewScore = Math.min(25, Math.max(0, approvedCount * 10 - changesRequestedCount * 5));
  score += reviewScore;

  return Math.min(100, score);
}
