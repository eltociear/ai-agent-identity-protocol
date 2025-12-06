#!/usr/bin/env node

/**
 * AAIP Achievement Logger Hook for Claude Code
 *
 * This hook is triggered after GitHub PR operations and sends
 * achievement data to the AAIP backend server.
 *
 * Environment variables:
 *   AAIP_API_URL - Backend server URL (default: http://localhost:3001)
 *   AAIP_AGENT_ID - Your registered agent ID (required)
 */

const https = require('https');
const http = require('http');

const AAIP_API_URL = process.env.AAIP_API_URL || 'http://localhost:3001';
const AAIP_AGENT_ID = process.env.AAIP_AGENT_ID;

// Read hook input from stdin
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    // Timeout after 1 second if no input
    setTimeout(() => resolve(data), 1000);
  });
}

// Parse tool call result
function parseToolResult(input) {
  try {
    return JSON.parse(input);
  } catch (e) {
    // Try to extract JSON from the input
    const match = input.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

// Extract PR info from tool result
function extractPRInfo(toolName, result) {
  if (!result) return null;

  // Handle create_pull_request result
  if (toolName.includes('create_pull_request')) {
    return {
      type: 'pr_created',
      repo: result.base?.repo?.full_name || result.html_url?.match(/github\.com\/([^/]+\/[^/]+)/)?.[1],
      pr_number: result.number,
      html_url: result.html_url,
      title: result.title,
      merged: false,
    };
  }

  // Handle merge_pull_request result
  if (toolName.includes('merge_pull_request')) {
    return {
      type: 'pr_merged',
      repo: result.owner && result.repo ? `${result.owner}/${result.repo}` : null,
      pr_number: result.pullNumber || result.pull_number,
      merged: result.merged === true,
      sha: result.sha,
    };
  }

  return null;
}

// Send achievement log to AAIP server
async function sendAchievementLog(prInfo) {
  if (!AAIP_AGENT_ID) {
    console.error('[AAIP] Warning: AAIP_AGENT_ID not set. Skipping achievement logging.');
    return;
  }

  if (!prInfo.repo || !prInfo.pr_number) {
    console.error('[AAIP] Invalid PR info:', prInfo);
    return;
  }

  const payload = {
    agent_id: AAIP_AGENT_ID,
    task_type: prInfo.type === 'pr_merged' ? 'github_pr_merged' : 'github_pr_created',
    github_repo: prInfo.repo,
    github_pr_number: prInfo.pr_number,
    metadata: {
      title: prInfo.title,
      merged: prInfo.merged,
      sha: prInfo.sha,
      logged_at: new Date().toISOString(),
    },
  };

  const url = new URL('/api/logs', AAIP_API_URL);
  const httpModule = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = httpModule.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[AAIP] Achievement logged: ${prInfo.type} for PR #${prInfo.pr_number}`);
          resolve(data);
        } else {
          console.error(`[AAIP] Failed to log achievement: ${res.statusCode} ${data}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[AAIP] Network error: ${err.message}`);
      // Don't fail the hook on network errors
      resolve(null);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

// Main hook execution
async function main() {
  const input = await readStdin();

  // Get tool name from environment or parse from input
  const toolName = process.env.CLAUDE_TOOL_NAME || '';

  const result = parseToolResult(input);
  const prInfo = extractPRInfo(toolName, result);

  if (prInfo) {
    await sendAchievementLog(prInfo);
  }
}

main().catch((err) => {
  console.error('[AAIP] Hook error:', err.message);
  // Don't exit with error code to avoid blocking Claude Code
  process.exit(0);
});
