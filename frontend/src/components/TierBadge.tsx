'use client';

import type { Tier } from '@/types';

interface TierBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md' | 'lg';
}

const tierConfig = {
  Bronze: {
    bg: 'bg-amber-700',
    text: 'text-amber-100',
    border: 'border-amber-600',
    icon: '🥉',
  },
  Silver: {
    bg: 'bg-gray-400',
    text: 'text-gray-900',
    border: 'border-gray-300',
    icon: '🥈',
  },
  Gold: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-900',
    border: 'border-yellow-400',
    icon: '🥇',
  },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const config = tierConfig[tier];
  const sizeClass = sizeConfig[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${config.bg} ${config.text} ${config.border} ${sizeClass}`}
    >
      <span>{config.icon}</span>
      <span>{tier}</span>
    </span>
  );
}
