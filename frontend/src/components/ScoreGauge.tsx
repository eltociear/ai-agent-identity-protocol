'use client';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-lg' },
  md: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-2xl' },
  lg: { width: 160, height: 160, strokeWidth: 10, fontSize: 'text-3xl' },
};

function getScoreColor(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return '#22c55e'; // green-500
  if (percentage >= 40) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
}

export function ScoreGauge({ score, maxScore = 1000, size = 'md' }: ScoreGaugeProps) {
  const config = sizeConfig[size];
  const percentage = Math.min((score / maxScore) * 100, 100);
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = getScoreColor(score, maxScore);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={config.width}
        height={config.height}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${config.fontSize}`} style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-gray-400">/ {maxScore}</span>
      </div>
    </div>
  );
}
