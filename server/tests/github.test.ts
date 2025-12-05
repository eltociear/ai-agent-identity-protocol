import { describe, it, expect } from 'vitest';
import { extractAgentIdFromPRBody, parseRepoString } from '../src/services/github.js';

describe('GitHub Service', () => {
  describe('extractAgentIdFromPRBody', () => {
    it('extracts agent ID from valid PR body', () => {
      const body = `
This PR fixes issue #42.

## Changes
- Fixed null pointer exception
- Added unit tests

---
AAIP-Agent: AGENT_0x1234abcd
`;
      const result = extractAgentIdFromPRBody(body);
      expect(result.success).toBe(true);
      expect(result.agentId).toBe('AGENT_0x1234abcd');
    });

    it('handles different AAIP-Agent formats', () => {
      // With colon
      expect(extractAgentIdFromPRBody('AAIP-Agent: agent123').agentId).toBe('agent123');

      // With multiple spaces
      expect(extractAgentIdFromPRBody('AAIP-Agent:    agent456').agentId).toBe('agent456');

      // Case insensitive
      expect(extractAgentIdFromPRBody('aaip-agent: myagent').agentId).toBe('myagent');
      expect(extractAgentIdFromPRBody('AAIP-AGENT: MYAGENT').agentId).toBe('MYAGENT');
    });

    it('returns error for empty body', () => {
      const result = extractAgentIdFromPRBody(null);
      expect(result.success).toBe(false);
      expect(result.error).toBe('PR body is empty');
    });

    it('returns error when tag not found', () => {
      const result = extractAgentIdFromPRBody('Just a regular PR description');
      expect(result.success).toBe(false);
      expect(result.error).toBe('AAIP-Agent tag not found in PR body');
    });

    it('handles agent ID with special characters', () => {
      const result = extractAgentIdFromPRBody('AAIP-Agent: agent_0x123-abc');
      expect(result.success).toBe(true);
      expect(result.agentId).toBe('agent_0x123-abc');
    });
  });

  describe('parseRepoString', () => {
    it('parses valid owner/repo format', () => {
      const result = parseRepoString('anthropics/claude-code');
      expect(result).toEqual({ owner: 'anthropics', repo: 'claude-code' });
    });

    it('returns null for invalid format', () => {
      expect(parseRepoString('invalid')).toBeNull();
      expect(parseRepoString('too/many/slashes')).toBeNull();
      expect(parseRepoString('')).toBeNull();
    });

    it('handles repos with hyphens and underscores', () => {
      const result = parseRepoString('my-org/my_repo-name');
      expect(result).toEqual({ owner: 'my-org', repo: 'my_repo-name' });
    });
  });
});
