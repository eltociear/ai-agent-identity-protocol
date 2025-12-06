// Starknet Contract Service
import { RpcProvider, Account, Contract, cairo, BlockTag } from 'starknet';
import { config } from '../utils/config.js';
import type { Agent, Achievement, AgentStats } from '../types/index.js';

// ABI definitions (minimal for our needs)
const AGENT_REGISTRY_ABI = [
  {
    name: 'register_agent',
    type: 'function',
    inputs: [
      { name: 'name', type: 'felt252' },
      { name: 'metadata_uri', type: 'ByteArray' },
      { name: 'github_repo', type: 'ByteArray' },
    ],
    outputs: [{ type: 'u256' }],
    state_mutability: 'external',
  },
  {
    name: 'get_agent',
    type: 'function',
    inputs: [{ name: 'agent_id', type: 'u256' }],
    outputs: [{ type: 'AgentView' }],
    state_mutability: 'view',
  },
  {
    name: 'get_agent_by_repo',
    type: 'function',
    inputs: [{ name: 'github_repo', type: 'ByteArray' }],
    outputs: [{ type: 'u256' }],
    state_mutability: 'view',
  },
  {
    name: 'get_agent_count',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'u256' }],
    state_mutability: 'view',
  },
  {
    name: 'get_agent_age_days',
    type: 'function',
    inputs: [{ name: 'agent_id', type: 'u256' }],
    outputs: [{ type: 'u64' }],
    state_mutability: 'view',
  },
] as const;

const ACHIEVEMENT_REGISTRY_ABI = [
  {
    name: 'add_achievement',
    type: 'function',
    inputs: [
      { name: 'agent_id', type: 'u256' },
      { name: 'task_type', type: 'felt252' },
      { name: 'source', type: 'felt252' },
      { name: 'log_hash', type: 'felt252' },
      { name: 'score', type: 'u8' },
      { name: 'review_approved_count', type: 'u8' },
      { name: 'review_changes_requested', type: 'u8' },
      { name: 'ci_passed', type: 'bool' },
    ],
    outputs: [{ type: 'u256' }],
    state_mutability: 'external',
  },
  {
    name: 'get_achievement',
    type: 'function',
    inputs: [{ name: 'achievement_id', type: 'u256' }],
    outputs: [{ type: 'AchievementView' }],
    state_mutability: 'view',
  },
  {
    name: 'get_agent_stats',
    type: 'function',
    inputs: [{ name: 'agent_id', type: 'u256' }],
    outputs: [{ type: 'AgentStatsView' }],
    state_mutability: 'view',
  },
  {
    name: 'get_achievements_by_agent',
    type: 'function',
    inputs: [
      { name: 'agent_id', type: 'u256' },
      { name: 'offset', type: 'u32' },
      { name: 'limit', type: 'u32' },
    ],
    outputs: [{ type: 'Array<AchievementView>' }],
    state_mutability: 'view',
  },
] as const;

let provider: RpcProvider | null = null;
let account: Account | null = null;
let agentRegistryContract: Contract | null = null;
let achievementRegistryContract: Contract | null = null;

/**
 * Initialize Starknet provider and account
 */
export function initStarknet(): { provider: RpcProvider; account: Account | null } {
  if (!provider) {
    provider = new RpcProvider({
      nodeUrl: config.starknetRpcUrl,
      // Use 'latest' instead of 'pending' for devnet compatibility
      blockIdentifier: BlockTag.LATEST,
    });
  }

  if (!account && config.serverPrivateKey && config.agentRegistryAddress) {
    // Note: In production, you'd derive the account address from the private key
    // For now, we use a placeholder - this would need proper account setup
    account = new Account(
      provider,
      config.agentRegistryAddress, // This should be the account address, not contract
      config.serverPrivateKey
    );
  }

  return { provider, account };
}

/**
 * Get AgentRegistry contract instance
 */
export function getAgentRegistryContract(): Contract | null {
  if (!config.agentRegistryAddress) {
    return null;
  }

  if (!agentRegistryContract) {
    const { provider: p } = initStarknet();
    agentRegistryContract = new Contract(
      AGENT_REGISTRY_ABI as unknown as ConstructorParameters<typeof Contract>[0],
      config.agentRegistryAddress,
      p
    );
  }

  return agentRegistryContract;
}

/**
 * Get AchievementRegistry contract instance
 */
export function getAchievementRegistryContract(): Contract | null {
  if (!config.achievementRegistryAddress) {
    return null;
  }

  if (!achievementRegistryContract) {
    const { provider: p } = initStarknet();
    achievementRegistryContract = new Contract(
      ACHIEVEMENT_REGISTRY_ABI as unknown as ConstructorParameters<typeof Contract>[0],
      config.achievementRegistryAddress,
      p
    );
  }

  return achievementRegistryContract;
}

/**
 * Get agent by ID from contract
 */
export async function getAgent(agentId: string): Promise<Agent | null> {
  const contract = getAgentRegistryContract();
  if (!contract) {
    return null;
  }

  try {
    const result = await contract.get_agent(cairo.uint256(agentId));
    return {
      agentId: result.agent_id.toString(),
      owner: result.owner.toString(),
      name: result.name.toString(),
      metadataUri: result.metadata_uri,
      githubRepo: result.github_repo,
      createdAt: Number(result.created_at),
      stakeAmount: result.stake_amount.toString(),
      isActive: result.is_active,
    };
  } catch (error) {
    console.error('Failed to get agent:', error);
    return null;
  }
}

/**
 * Get agent ID by GitHub repo
 */
export async function getAgentByRepo(githubRepo: string): Promise<string | null> {
  const contract = getAgentRegistryContract();
  if (!contract) {
    return null;
  }

  try {
    const result = await contract.get_agent_by_repo(githubRepo);
    const agentId = result.toString();
    return agentId === '0' ? null : agentId;
  } catch (error) {
    console.error('Failed to get agent by repo:', error);
    return null;
  }
}

/**
 * Get agent age in days
 */
export async function getAgentAgeDays(agentId: string): Promise<number | null> {
  const contract = getAgentRegistryContract();
  if (!contract) {
    return null;
  }

  try {
    const result = await contract.get_agent_age_days(cairo.uint256(agentId));
    return Number(result);
  } catch (error) {
    console.error('Failed to get agent age:', error);
    return null;
  }
}

/**
 * Get agent stats
 */
export async function getAgentStats(agentId: string): Promise<AgentStats | null> {
  const contract = getAchievementRegistryContract();
  if (!contract) {
    return null;
  }

  try {
    const result = await contract.get_agent_stats(cairo.uint256(agentId));
    return {
      totalTasks: Number(result.total_tasks),
      successfulTasks: Number(result.successful_tasks),
      totalReviewScore: Number(result.total_review_score),
      uniqueTaskTypes: Number(result.unique_task_types),
      lastActivity: Number(result.last_activity),
    };
  } catch (error) {
    console.error('Failed to get agent stats:', error);
    return null;
  }
}

/**
 * Add achievement to contract (requires account with write access)
 */
export async function addAchievement(
  agentId: string,
  taskType: string,
  source: string,
  logHash: string,
  score: number,
  reviewApprovedCount: number,
  reviewChangesRequested: number,
  ciPassed: boolean
): Promise<string | null> {
  const { account: acc } = initStarknet();
  if (!acc || !config.achievementRegistryAddress) {
    console.error('Account or contract address not configured');
    return null;
  }

  try {
    const contract = getAchievementRegistryContract();
    if (!contract) {
      return null;
    }

    // Connect account to contract for write operations
    contract.connect(acc);

    const result = await contract.add_achievement(
      cairo.uint256(agentId),
      taskType,
      source,
      logHash,
      score,
      reviewApprovedCount,
      reviewChangesRequested,
      ciPassed
    );

    return result.toString();
  } catch (error) {
    console.error('Failed to add achievement:', error);
    return null;
  }
}

/**
 * Get total agent count
 */
export async function getAgentCount(): Promise<number | null> {
  const contract = getAgentRegistryContract();
  if (!contract) {
    return null;
  }

  try {
    const result = await contract.get_agent_count();
    return Number(result);
  } catch (error) {
    console.error('Failed to get agent count:', error);
    return null;
  }
}

/**
 * Get achievements by agent
 */
export async function getAchievementsByAgent(
  agentId: string,
  offset: number,
  limit: number
): Promise<Achievement[]> {
  const contract = getAchievementRegistryContract();
  if (!contract) {
    return [];
  }

  try {
    const result = await contract.get_achievements_by_agent(
      cairo.uint256(agentId),
      offset,
      limit
    );

    return result.map((a: Record<string, unknown>) => ({
      achievementId: String(a.achievement_id),
      agentId: String(a.agent_id),
      taskType: String(a.task_type),
      source: String(a.source),
      logHash: String(a.log_hash),
      score: Number(a.score),
      reviewApprovedCount: Number(a.review_approved_count),
      reviewChangesRequested: Number(a.review_changes_requested),
      ciPassed: Boolean(a.ci_passed),
      timestamp: Number(a.timestamp),
    }));
  } catch (error) {
    console.error('Failed to get achievements:', error);
    return [];
  }
}
