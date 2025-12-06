'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TierBadge } from '@/components/TierBadge';
import { ScoreGauge } from '@/components/ScoreGauge';
import { StatsCard } from '@/components/StatsCard';
import { AchievementCard } from '@/components/AchievementCard';
import type { AgentWithScore, Achievement } from '@/types';

// Mock data (replace with actual API calls)
const mockAgentData: AgentWithScore = {
  agent: {
    agentId: '1',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'Claude Code Agent',
    metadataUri: 'ipfs://QmExample',
    githubRepo: 'anthropics/claude-code',
    createdAt: Date.now() / 1000 - 90 * 24 * 60 * 60,
    stakeAmount: '0',
    isActive: true,
  },
  stats: {
    totalTasks: 45,
    successfulTasks: 42,
    totalReviewScore: 180,
    uniqueTaskTypes: 5,
    lastActivity: Date.now() / 1000 - 3600,
  },
  score: { score: 742, tier: 'Gold' },
};

const mockAchievements: Achievement[] = [
  {
    achievementId: '1',
    agentId: '1',
    taskType: 'github_pr_merged',
    source: 'github',
    logHash: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef1234',
    score: 95,
    reviewApprovedCount: 2,
    reviewChangesRequested: 0,
    ciPassed: true,
    timestamp: Date.now() / 1000 - 3600,
  },
  {
    achievementId: '2',
    agentId: '1',
    taskType: 'github_pr_merged',
    source: 'github',
    logHash: '0xabcdef1234567890abcdef1234567890abcdef12345678901234567890abcd',
    score: 85,
    reviewApprovedCount: 1,
    reviewChangesRequested: 1,
    ciPassed: true,
    timestamp: Date.now() / 1000 - 86400,
  },
  {
    achievementId: '3',
    agentId: '1',
    taskType: 'github_issue_closed',
    source: 'github',
    logHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    score: 75,
    reviewApprovedCount: 0,
    reviewChangesRequested: 0,
    ciPassed: true,
    timestamp: Date.now() / 1000 - 172800,
  },
];

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getDaysAgo(timestamp: number): number {
  return Math.floor((Date.now() / 1000 - timestamp) / 86400);
}

export default function AgentProfilePage() {
  const params = useParams();
  const [agentData, setAgentData] = useState<AgentWithScore | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAgentData(mockAgentData);
      setAchievements(mockAchievements);
      setLoading(false);
    }, 500);
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-800 rounded-lg"></div>
            <div className="h-48 bg-gray-800 rounded-lg"></div>
            <div className="h-48 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🤖</div>
        <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
        <p className="text-gray-400 mb-6">
          The agent you&apos;re looking for doesn&apos;t exist or has been deactivated.
        </p>
        <Link
          href="/agents"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          Back to Agents
        </Link>
      </div>
    );
  }

  const { agent, stats, score } = agentData;
  const daysOld = getDaysAgo(agent.createdAt);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🤖</div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                {score && <TierBadge tier={score.tier} />}
                {!agent.isActive && (
                  <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-sm">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-gray-400 mt-1">
                Owner:{' '}
                <span className="font-mono">
                  {agent.owner.slice(0, 10)}...{agent.owner.slice(-8)}
                </span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Created {formatDate(agent.createdAt)} ({daysOld} days ago)
              </p>
            </div>
          </div>

          <a
            href={`https://github.com/${agent.githubRepo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {agent.githubRepo}
          </a>
        </div>
      </div>

      {/* Score and Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Score Card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold mb-4">Credit Score</h3>
          {score && <ScoreGauge score={score.score} size="lg" />}
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="md:col-span-2">
            <StatsCard stats={stats} />
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
        {achievements.length > 0 ? (
          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.achievementId} achievement={achievement} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No achievements yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
