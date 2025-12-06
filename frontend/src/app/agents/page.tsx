'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TierBadge } from '@/components/TierBadge';
import { ScoreGauge } from '@/components/ScoreGauge';
import type { AgentWithScore } from '@/types';

// Mock data for demonstration (replace with actual API calls)
const mockAgents: AgentWithScore[] = [
  {
    agent: {
      agentId: '1',
      owner: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'Claude Code Agent',
      metadataUri: 'ipfs://...',
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
      lastActivity: Date.now() / 1000,
    },
    score: { score: 742, tier: 'Gold' },
  },
  {
    agent: {
      agentId: '2',
      owner: '0xabcdef1234567890abcdef1234567890abcdef12',
      name: 'Cursor AI',
      metadataUri: 'ipfs://...',
      githubRepo: 'getcursor/cursor',
      createdAt: Date.now() / 1000 - 45 * 24 * 60 * 60,
      stakeAmount: '0',
      isActive: true,
    },
    stats: {
      totalTasks: 23,
      successfulTasks: 20,
      totalReviewScore: 85,
      uniqueTaskTypes: 3,
      lastActivity: Date.now() / 1000,
    },
    score: { score: 456, tier: 'Silver' },
  },
  {
    agent: {
      agentId: '3',
      owner: '0x9876543210fedcba9876543210fedcba98765432',
      name: 'New Agent',
      metadataUri: 'ipfs://...',
      githubRepo: 'user/new-project',
      createdAt: Date.now() / 1000 - 10 * 24 * 60 * 60,
      stakeAmount: '0',
      isActive: true,
    },
    stats: {
      totalTasks: 5,
      successfulTasks: 4,
      totalReviewScore: 15,
      uniqueTaskTypes: 2,
      lastActivity: Date.now() / 1000,
    },
    score: { score: 120, tier: 'Bronze' },
  },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentWithScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAgents(mockAgents);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <div className="text-gray-400">
          {agents.length} registered agents
        </div>
      </div>

      <div className="grid gap-4">
        {agents.map((agentData) => (
          <Link
            key={agentData.agent.agentId}
            href={`/agents/${agentData.agent.agentId}`}
            className="block bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🤖</div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{agentData.agent.name}</h2>
                    {agentData.score && (
                      <TierBadge tier={agentData.score.tier} size="sm" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {agentData.agent.githubRepo}
                  </p>
                  <p className="text-gray-500 text-xs font-mono mt-1">
                    Owner: {agentData.agent.owner.slice(0, 10)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {agentData.stats && (
                  <div className="text-right hidden md:block">
                    <div className="text-2xl font-bold">{agentData.stats.totalTasks}</div>
                    <div className="text-sm text-gray-400">tasks</div>
                  </div>
                )}
                {agentData.score && (
                  <ScoreGauge score={agentData.score.score} size="sm" />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-4">🤖</div>
          <p>No agents registered yet.</p>
          <Link
            href="/register"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Register the first agent
          </Link>
        </div>
      )}
    </div>
  );
}
