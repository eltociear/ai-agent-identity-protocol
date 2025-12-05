import { describe, it, expect } from 'vitest';
import {
  createCanonicalRecord,
  computeLogHash,
  computeAchievementScore,
} from '../src/utils/hash.js';

describe('Hash Utilities', () => {
  describe('createCanonicalRecord', () => {
    it('creates a valid canonical record', () => {
      const record = createCanonicalRecord(
        'owner/repo',
        123,
        true,
        '2024-01-15T10:00:00Z',
        'success',
        2,
        0,
        'agent123',
        'github_pr_merged'
      );

      expect(record.source).toBe('github');
      expect(record.repo).toBe('owner/repo');
      expect(record.prNumber).toBe(123);
      expect(record.merged).toBe(true);
      expect(record.mergedAt).toBe('2024-01-15T10:00:00Z');
      expect(record.ciStatus).toBe('success');
      expect(record.reviews.approvedCount).toBe(2);
      expect(record.reviews.changesRequestedCount).toBe(0);
      expect(record.agentId).toBe('agent123');
      expect(record.agentIdVerified).toBe(true);
      expect(record.taskType).toBe('github_pr_merged');
      expect(record.verifiedAt).toBeDefined();
    });
  });

  describe('computeLogHash', () => {
    it('produces consistent hash for same input', () => {
      const record = createCanonicalRecord(
        'owner/repo',
        123,
        true,
        '2024-01-15T10:00:00Z',
        'success',
        2,
        0,
        'agent123',
        'github_pr_merged'
      );

      // Override verifiedAt for deterministic testing
      const fixedRecord = { ...record, verifiedAt: '2024-01-15T10:00:00Z' };

      const hash1 = computeLogHash(fixedRecord);
      const hash2 = computeLogHash(fixedRecord);

      expect(hash1).toBe(hash2);
    });

    it('produces different hash for different input', () => {
      const record1 = createCanonicalRecord(
        'owner/repo',
        123,
        true,
        '2024-01-15T10:00:00Z',
        'success',
        2,
        0,
        'agent123',
        'github_pr_merged'
      );

      const record2 = createCanonicalRecord(
        'owner/repo',
        124, // Different PR number
        true,
        '2024-01-15T10:00:00Z',
        'success',
        2,
        0,
        'agent123',
        'github_pr_merged'
      );

      // Override verifiedAt for deterministic testing
      const fixedRecord1 = { ...record1, verifiedAt: '2024-01-15T10:00:00Z' };
      const fixedRecord2 = { ...record2, verifiedAt: '2024-01-15T10:00:00Z' };

      const hash1 = computeLogHash(fixedRecord1);
      const hash2 = computeLogHash(fixedRecord2);

      expect(hash1).not.toBe(hash2);
    });

    it('produces felt252-compatible hash', () => {
      const record = createCanonicalRecord(
        'owner/repo',
        123,
        true,
        '2024-01-15T10:00:00Z',
        'success',
        2,
        0,
        'agent123',
        'github_pr_merged'
      );

      const hash = computeLogHash(record);

      // Should be a hex string starting with 0x
      expect(hash).toMatch(/^0x[0-9a-f]+$/);

      // Should be less than 2^252
      const hashBigInt = BigInt(hash);
      const felt252Max = (BigInt(1) << BigInt(252)) - BigInt(1);
      expect(hashBigInt).toBeLessThanOrEqual(felt252Max);
    });
  });

  describe('computeAchievementScore', () => {
    it('gives base score of 50 for merged PR', () => {
      const score = computeAchievementScore(false, 0, 0);
      expect(score).toBe(50);
    });

    it('adds 25 points for CI passed', () => {
      const scoreWithCI = computeAchievementScore(true, 0, 0);
      const scoreWithoutCI = computeAchievementScore(false, 0, 0);
      expect(scoreWithCI - scoreWithoutCI).toBe(25);
    });

    it('adds review bonus for approvals', () => {
      const scoreNoApproval = computeAchievementScore(false, 0, 0);
      const scoreOneApproval = computeAchievementScore(false, 1, 0);
      const scoreTwoApprovals = computeAchievementScore(false, 2, 0);

      expect(scoreOneApproval).toBe(scoreNoApproval + 10);
      expect(scoreTwoApprovals).toBe(scoreNoApproval + 20);
    });

    it('subtracts points for changes requested', () => {
      const scoreNoChanges = computeAchievementScore(false, 2, 0);
      const scoreWithChanges = computeAchievementScore(false, 2, 2);

      expect(scoreWithChanges).toBeLessThan(scoreNoChanges);
    });

    it('caps total score at 100', () => {
      const score = computeAchievementScore(true, 10, 0);
      expect(score).toBe(100);
    });

    it('does not go below 50 for review penalties', () => {
      const score = computeAchievementScore(false, 0, 10);
      expect(score).toBe(50); // Base 50 + max(0, 0 - 50) = 50
    });
  });
});
