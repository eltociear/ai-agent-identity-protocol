// Environment configuration
import 'dotenv/config';
import type { Config } from '../types/index.js';

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function loadConfig(): Config {
  return {
    port: parseInt(getEnvVar('PORT', '3001'), 10),
    githubToken: getEnvVar('GITHUB_TOKEN', ''),
    starknetRpcUrl: getEnvVar('STARKNET_RPC_URL', 'https://starknet-sepolia.public.blastapi.io'),
    agentRegistryAddress: getEnvVar('AGENT_REGISTRY_ADDRESS', ''),
    achievementRegistryAddress: getEnvVar('ACHIEVEMENT_REGISTRY_ADDRESS', ''),
    serverPrivateKey: getEnvVar('SERVER_PRIVATE_KEY', ''),
  };
}

export const config = loadConfig();
