// GitHub API Service
import { Octokit } from 'octokit';
import type { GitHubPRInfo, AgentIdExtraction } from '../types/index.js';
import { config } from '../utils/config.js';

// AAIP-Agent pattern for PR body identification
const AAIP_AGENT_PATTERN = /AAIP-Agent:\s*(\S+)/i;

let octokitInstance: Octokit | null = null;

export function getOctokit(): Octokit {
  if (!octokitInstance) {
    octokitInstance = new Octokit({
      auth: config.githubToken || undefined,
    });
  }
  return octokitInstance;
}

/**
 * Extract agent ID from PR body
 */
export function extractAgentIdFromPRBody(body: string | null): AgentIdExtraction {
  if (!body) {
    return { success: false, error: 'PR body is empty' };
  }

  const match = body.match(AAIP_AGENT_PATTERN);
  if (!match) {
    return { success: false, error: 'AAIP-Agent tag not found in PR body' };
  }

  return { success: true, agentId: match[1] };
}

/**
 * Parse owner/repo format
 */
export function parseRepoString(repoString: string): { owner: string; repo: string } | null {
  const parts = repoString.split('/');
  if (parts.length !== 2) {
    return null;
  }
  return { owner: parts[0], repo: parts[1] };
}

/**
 * Get PR information from GitHub API
 */
export async function getPRInfo(
  repoString: string,
  prNumber: number
): Promise<GitHubPRInfo | null> {
  const parsed = parseRepoString(repoString);
  if (!parsed) {
    return null;
  }

  const octokit = getOctokit();
  const { owner, repo } = parsed;

  try {
    // Get PR details
    const { data: pr } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    // Get CI status (check runs)
    let ciStatus: 'success' | 'failure' | 'pending' = 'pending';
    if (pr.head.sha) {
      try {
        const { data: checkRuns } = await octokit.rest.checks.listForRef({
          owner,
          repo,
          ref: pr.head.sha,
        });

        if (checkRuns.total_count > 0) {
          const allSuccess = checkRuns.check_runs.every(
            (run) => run.conclusion === 'success'
          );
          const anyFailure = checkRuns.check_runs.some(
            (run) => run.conclusion === 'failure'
          );

          if (anyFailure) {
            ciStatus = 'failure';
          } else if (allSuccess) {
            ciStatus = 'success';
          }
        }
      } catch {
        // If check runs API fails, try commit status
        try {
          const { data: status } = await octokit.rest.repos.getCombinedStatusForRef({
            owner,
            repo,
            ref: pr.head.sha,
          });
          ciStatus = status.state === 'success' ? 'success' :
                     status.state === 'failure' ? 'failure' : 'pending';
        } catch {
          // Keep default 'pending'
        }
      }
    }

    // Get reviews
    const { data: reviews } = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: prNumber,
    });

    const approvedCount = reviews.filter((r) => r.state === 'APPROVED').length;
    const changesRequestedCount = reviews.filter(
      (r) => r.state === 'CHANGES_REQUESTED'
    ).length;

    return {
      repo: repoString,
      prNumber,
      merged: pr.merged,
      mergedAt: pr.merged_at,
      ciStatus,
      reviews: {
        approvedCount,
        changesRequestedCount,
      },
      body: pr.body,
    };
  } catch (error) {
    console.error('Failed to get PR info:', error);
    return null;
  }
}

/**
 * Verify PR ownership by agent
 */
export async function verifyPROwnership(
  repoString: string,
  prNumber: number,
  expectedAgentId: string,
  registeredRepo: string
): Promise<{ valid: boolean; reason?: string; prInfo?: GitHubPRInfo }> {
  // 1. Get PR info
  const prInfo = await getPRInfo(repoString, prNumber);
  if (!prInfo) {
    return { valid: false, reason: 'Failed to fetch PR information' };
  }

  // 2. Extract agent_id from PR body
  const extraction = extractAgentIdFromPRBody(prInfo.body);
  if (!extraction.success) {
    return { valid: false, reason: extraction.error };
  }

  // 3. Verify agent_id matches
  if (extraction.agentId !== expectedAgentId) {
    return {
      valid: false,
      reason: `Agent ID mismatch: expected ${expectedAgentId}, got ${extraction.agentId}`,
    };
  }

  // 4. Verify repository binding
  if (registeredRepo !== repoString) {
    return {
      valid: false,
      reason: `Repo mismatch: agent registered for ${registeredRepo}, PR is in ${repoString}`,
    };
  }

  return { valid: true, prInfo };
}
