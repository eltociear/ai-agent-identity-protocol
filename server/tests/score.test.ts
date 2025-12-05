import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  getTier,
  calculateScoreResult,
  calculateAvgReviewScore,
} from '../src/services/score.js';

describe('Score Calculation', () => {
  describe('calculateScore', () => {
    it('returns 0 for zero tasks', () => {
      const score = calculateScore({
        totalTasks: 0,
        successfulTasks: 0,
        avgReviewScore: 0,
        uniqueTaskTypes: 0,
        daysSinceCreated: 0,
      });
      expect(score).toBe(0);
    });

    it('calculates score for a new agent with perfect stats', () => {
      const score = calculateScore({
        totalTasks: 10,
        successfulTasks: 10,
        avgReviewScore: 5,
        uniqueTaskTypes: 5,
        daysSinceCreated: 90,
      });
      // 10000 * 500 * 5 * 100 / 1_000_000 = 2500, capped at 1000
      expect(score).toBeLessThanOrEqual(1000);
      expect(score).toBeGreaterThan(0);
    });

    it('gives lower score for younger agents', () => {
      const scoreOld = calculateScore({
        totalTasks: 10,
        successfulTasks: 8,
        avgReviewScore: 4,
        uniqueTaskTypes: 3,
        daysSinceCreated: 90,
      });

      const scoreNew = calculateScore({
        totalTasks: 10,
        successfulTasks: 8,
        avgReviewScore: 4,
        uniqueTaskTypes: 3,
        daysSinceCreated: 10,
      });

      expect(scoreOld).toBeGreaterThan(scoreNew);
    });

    it('gives lower score for lower success rate', () => {
      const scoreHigh = calculateScore({
        totalTasks: 10,
        successfulTasks: 10,
        avgReviewScore: 4,
        uniqueTaskTypes: 3,
        daysSinceCreated: 60,
      });

      const scoreLow = calculateScore({
        totalTasks: 10,
        successfulTasks: 5,
        avgReviewScore: 4,
        uniqueTaskTypes: 3,
        daysSinceCreated: 60,
      });

      expect(scoreHigh).toBeGreaterThan(scoreLow);
    });

    it('caps diversity score at 10', () => {
      const scoreMax = calculateScore({
        totalTasks: 10,
        successfulTasks: 10,
        avgReviewScore: 5,
        uniqueTaskTypes: 10,
        daysSinceCreated: 90,
      });

      const scoreOver = calculateScore({
        totalTasks: 10,
        successfulTasks: 10,
        avgReviewScore: 5,
        uniqueTaskTypes: 20,
        daysSinceCreated: 90,
      });

      expect(scoreMax).toBe(scoreOver);
    });
  });

  describe('getTier', () => {
    it('returns Bronze for agents under 30 days', () => {
      expect(getTier(500, 29)).toBe('Bronze');
      expect(getTier(1000, 0)).toBe('Bronze');
    });

    it('returns Silver for agents 30-89 days', () => {
      expect(getTier(500, 30)).toBe('Silver');
      expect(getTier(500, 89)).toBe('Silver');
    });

    it('returns Silver for agents 90+ days with score < 300', () => {
      expect(getTier(299, 90)).toBe('Silver');
      expect(getTier(0, 100)).toBe('Silver');
    });

    it('returns Gold for agents 90+ days with score >= 300', () => {
      expect(getTier(300, 90)).toBe('Gold');
      expect(getTier(1000, 365)).toBe('Gold');
    });
  });

  describe('calculateScoreResult', () => {
    it('returns both score and tier', () => {
      const result = calculateScoreResult({
        totalTasks: 10,
        successfulTasks: 8,
        avgReviewScore: 4,
        uniqueTaskTypes: 5,
        daysSinceCreated: 100,
      });

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('tier');
      expect(typeof result.score).toBe('number');
      expect(['Bronze', 'Silver', 'Gold']).toContain(result.tier);
    });
  });

  describe('calculateAvgReviewScore', () => {
    it('returns 0 for zero tasks', () => {
      expect(calculateAvgReviewScore(0, 0)).toBe(0);
    });

    it('calculates average correctly', () => {
      // 3 tasks with 5 points each (approvals) = 15 / 3 = 5
      expect(calculateAvgReviewScore(15, 3)).toBe(5);
    });

    it('clamps to 1-5 range', () => {
      expect(calculateAvgReviewScore(100, 10)).toBe(5); // 10 would be clamped to 5
      expect(calculateAvgReviewScore(1, 10)).toBe(1); // 0.1 would be clamped to 1
    });
  });
});
