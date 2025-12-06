'use client';

import type { AgentStats } from '@/types';
import { calculateSuccessRate, formatAvgReviewScore } from '@/lib/utils';

interface StatsCardProps {
  stats: AgentStats;
}

export function StatsCard({ stats }: StatsCardProps) {
  const successRate = calculateSuccessRate(stats);
  const avgReviewScore = formatAvgReviewScore(stats);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-white">{stats.totalTasks}</div>
          <div className="text-sm text-gray-400">Total Tasks</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-500">{successRate}%</div>
          <div className="text-sm text-gray-400">Success Rate</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-500">{avgReviewScore}</div>
          <div className="text-sm text-gray-400">Avg Review</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-500">{stats.uniqueTaskTypes}</div>
          <div className="text-sm text-gray-400">Task Types</div>
        </div>
      </div>
    </div>
  );
}
