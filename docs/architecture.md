# AAIP Architecture

## Overview

AAIP (AI Agent Identity Protocol) is a decentralized identity and credit score system for AI agents, built on Starknet. It provides verifiable, on-chain records of AI agent behavior.

## Design Principles

1. **External Facts Over Self-Reports**: AI self-reports are not trusted. Ground truth comes from GitHub, CI systems, and other external sources.
2. **Sybil Resistance**: Age factor and tier system prevent gaming through multiple identities.
3. **ZK-Friendly**: All calculations use integer arithmetic for future ZK compatibility.
4. **One Agent = One Repo (MVP)**: Simplified binding for Phase 1.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              User Layer                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐           │
│   │  Claude Code │     │   Frontend   │     │   GitHub     │           │
│   │  (AI Agent)  │     │   (Next.js)  │     │   Webhooks   │           │
│   └──────┬───────┘     └──────┬───────┘     └──────┬───────┘           │
│          │                    │                    │                    │
└──────────┼────────────────────┼────────────────────┼────────────────────┘
           │                    │                    │
           │  POST /api/logs    │  GET /api/agents   │  POST /api/webhooks
           │                    │                    │
           ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Backend Server                                 │
│                              (Hono)                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐           │
│   │   GitHub     │     │    Score     │     │   Starknet   │           │
│   │   Service    │     │   Service    │     │   Service    │           │
│   │  (Octokit)   │     │ (Calculator) │     │ (starknet.js)│           │
│   └──────────────┘     └──────────────┘     └──────────────┘           │
│                                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │  Contract Calls
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Starknet (Sepolia)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌────────────────────┐           ┌────────────────────┐              │
│   │   AgentRegistry    │           │ AchievementRegistry │              │
│   ├────────────────────┤           ├────────────────────┤              │
│   │ - register_agent   │◄─────────►│ - add_achievement  │              │
│   │ - get_agent        │           │ - get_agent_stats  │              │
│   │ - get_agent_by_repo│           │ - verify_log_hash  │              │
│   └────────────────────┘           └────────────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Agent Registration

```
1. User connects Starknet wallet
2. User fills registration form (name, repo)
3. Frontend calls AgentRegistry.register_agent()
4. Contract stores agent data, emits AgentRegistered event
5. Frontend displays success with Agent ID
```

### Achievement Recording

```
1. Claude Code creates/merges PR with AAIP-Agent tag
2. Hook sends log to POST /api/logs
3. Server fetches PR from GitHub API
4. Server extracts and verifies AAIP-Agent tag
5. Server checks: CI status, reviews, merge status
6. Server computes canonical record hash
7. Server calls AchievementRegistry.add_achievement()
8. Contract stores achievement, updates stats
```

### Score Calculation

```
Score = (SuccessRate × AvgReview × Diversity × AgeFactor) / NORMALIZE

Where:
- SuccessRate = (successfulTasks × 10000) / totalTasks
- AvgReview = reviewScore × 100
- Diversity = min(uniqueTaskTypes, 10)
- AgeFactor = min(daysSinceCreated × 100 / 90, 100)
- NORMALIZE = 1,000,000

Result: 0-1000 score range
```

### Tier System

| Tier | Requirements |
|------|-------------|
| Bronze | Account age < 30 days |
| Silver | Account age < 90 days OR score < 300 |
| Gold | Account age >= 90 days AND score >= 300 |

## Contract Architecture

### AgentRegistry

**Storage**:
```cairo
agents: Map<u256, Agent>
owner_to_agents: Map<ContractAddress, Vec<u256>>
repo_to_agent: Map<ByteArray, u256>
next_agent_id: u256
```

**Key Functions**:
- `register_agent(name, metadata_uri, github_repo)`: Register new agent
- `get_agent(agent_id)`: Retrieve agent data
- `get_agent_by_repo(repo)`: Find agent by repository

### AchievementRegistry

**Storage**:
```cairo
achievements: Map<u256, Achievement>
agent_achievements: Map<u256, Vec<u256>>
agent_stats: Map<u256, AgentStats>
agent_registry: ContractAddress
authorized_submitter: ContractAddress
```

**Key Functions**:
- `add_achievement(...)`: Record new achievement (authorized only)
- `get_agent_stats(agent_id)`: Get aggregated statistics
- `verify_log_hash(achievement_id, hash)`: Verify proof

## Security Considerations

### Access Control
- Only `authorized_submitter` can call `add_achievement`
- Only agent owner can call `update_metadata`, `deactivate_agent`

### Sybil Resistance
- One repository = One agent (prevents multiple registrations)
- Age factor penalizes new accounts
- Tier system requires time investment

### Data Integrity
- Log hash computed from canonical record
- Anyone can independently verify by recomputing hash
- On-chain data is immutable

## Future Enhancements (Phase 2)

1. **GitHub App Integration**: OAuth-based binding, multi-repo support
2. **ZK Proofs**: Verify score calculations on-chain
3. **Staking**: Economic Sybil resistance
4. **Cross-Chain**: Bridge to other L2s
5. **Additional Sources**: GitLab, Jira, Linear integration
