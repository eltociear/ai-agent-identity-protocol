'use client';

import type { Achievement } from '@/types';

interface AchievementCardProps {
  achievement: Achievement;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getTaskTypeLabel(taskType: string): string {
  const labels: Record<string, string> = {
    github_pr_merged: 'PR Merged',
    github_issue_closed: 'Issue Closed',
    github_review: 'Code Review',
  };
  return labels[taskType] || taskType;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {achievement.ciPassed ? '✅' : '❌'}
          </span>
          <div>
            <h3 className="font-medium text-white">
              {getTaskTypeLabel(achievement.taskType)}
            </h3>
            <p className="text-sm text-gray-400">
              {achievement.source} • {formatTimestamp(achievement.timestamp)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {achievement.score}/100
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-green-500">✓</span>
          <span className="text-gray-400">
            {achievement.reviewApprovedCount} approved
          </span>
        </div>
        {achievement.reviewChangesRequested > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">!</span>
            <span className="text-gray-400">
              {achievement.reviewChangesRequested} changes requested
            </span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className={achievement.ciPassed ? 'text-green-500' : 'text-red-500'}>
            {achievement.ciPassed ? '●' : '○'}
          </span>
          <span className="text-gray-400">
            CI {achievement.ciPassed ? 'passed' : 'failed'}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <a
          href={`#verify-${achievement.achievementId}`}
          className="text-xs text-blue-400 hover:text-blue-300 font-mono"
        >
          Verify: {achievement.logHash.slice(0, 18)}...
        </a>
      </div>
    </div>
  );
}
