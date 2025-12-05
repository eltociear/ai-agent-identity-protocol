// API client for backend communication

import type { ApiResponse, AgentWithScore, Achievement } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getAgentCount(): Promise<number | null> {
  const response = await fetchApi<{ count: number }>('/api/agents');
  return response.success ? response.data?.count ?? null : null;
}

export async function getAgent(agentId: string): Promise<AgentWithScore | null> {
  const response = await fetchApi<AgentWithScore>(`/api/agents/${agentId}`);
  return response.success ? response.data ?? null : null;
}

export async function getAgentAchievements(
  agentId: string,
  offset = 0,
  limit = 10
): Promise<Achievement[]> {
  const response = await fetchApi<{ achievements: Achievement[] }>(
    `/api/agents/${agentId}/achievements?offset=${offset}&limit=${limit}`
  );
  return response.success ? response.data?.achievements ?? [] : [];
}

export async function getAgentByRepo(
  owner: string,
  repo: string
): Promise<AgentWithScore | null> {
  const response = await fetchApi<AgentWithScore>(`/api/agents/by-repo/${owner}/${repo}`);
  return response.success ? response.data ?? null : null;
}
