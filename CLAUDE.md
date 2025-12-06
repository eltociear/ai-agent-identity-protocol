# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Agent Identity Protocol (AAIP) - A decentralized identity and credit score layer on Starknet for AI agents. "LinkedIn for AI Agents" - tracking AI behavior with verifiable on-chain records based on external facts (GitHub PRs, CI status, code reviews), not self-reported data.

**Current Status**: All milestones complete (Contracts, Backend, Frontend, Integration).

## Build/Test/Lint Commands

### Smart Contracts (Cairo/Starknet)
```bash
cd contracts
scarb build           # Build contracts
snforge test          # Run Starknet Foundry tests (22 tests)
```

### Backend (Node.js/TypeScript)
```bash
cd server
npm install
npm run dev           # Development server (port 3001)
npm test              # Run tests (31 tests)
npm run build         # TypeScript build
npm run lint          # ESLint
npm run format        # Prettier
```

### Frontend (Next.js)
```bash
cd frontend
npm install --legacy-peer-deps  # React 19 peer dep workaround
npm run dev           # Dev server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
```

### Deployment
```bash
./scripts/deploy.sh   # Deploy contracts to Starknet Sepolia
```

## Architecture

### Three-Layer System
1. **contracts/** - Cairo 2.13.1 smart contracts on Starknet (Scarb + Starknet Foundry)
2. **server/** - Node.js/TypeScript backend (Hono + Octokit + starknet.js)
3. **frontend/** - Next.js 14+ with starknet-react and Tailwind CSS

### Core Smart Contracts
- **AgentRegistry** (`contracts/src/agent_registry.cairo`): Manages agent registration with 1:1 agent-to-repository binding. Key functions: `register_agent`, `get_agent`, `get_agent_by_repo`.
- **AchievementRegistry** (`contracts/src/achievement_registry.cairo`): Records verified achievements. Only authorized server wallet can submit. Key functions: `add_achievement`, `get_agent_stats`, `verify_log_hash`.

### Backend Services
- **github.ts**: GitHub API integration, PR info extraction, AAIP-Agent tag parsing
- **score.ts**: Integer-based credit score calculation, tier determination
- **starknet.ts**: Contract interaction via starknet.js

### Frontend Pages
- `/` - Landing page with features and how-it-works
- `/agents` - Agent directory with tier badges and scores
- `/agents/[id]` - Agent profile with stats and achievements
- `/register` - Wallet-connected agent registration form

### Key Design Principles
- **External Facts Only**: Trust GitHub API, never agent self-reporting. MCP logs are for linking only.
- **1 Agent = 1 Repository (MVP)**: Agent permanently bound to single GitHub repo at registration.
- **PR Body Identification**: PRs must include `AAIP-Agent: {agent_id}` tag for attribution.
- **Integer-Based Scoring**: ZK-friendly calculations, no floating point.
- **Sybil Resistance**: Age factor + Tier system (Bronze < 30d, Silver < 90d, Gold >= 90d with score >= 300).

### Verification Flow
```
MCP Log (PR URL + agent_id)
    -> GitHub API (merged? CI? reviews?)
    -> Validate agent_id from PR body matches registered repo
    -> Create canonical record + hash (keccak256)
    -> Submit to Starknet (add_achievement)
```

### Score Calculation
```typescript
// Integer-based (ZK-friendly)
successRateBp = (successfulTasks * 10000) / totalTasks
avgReviewBp = avgReviewScore * 100
diversityScore = min(uniqueTaskTypes, 10)
ageFactorBp = min(daysSinceCreated * 100 / 90, 100)

score = (successRateBp * avgReviewBp * diversityScore * ageFactorBp) / 1_000_000
// Result: 0-1000 range
```

### Tier System
| Tier | Requirements |
|------|-------------|
| Bronze | Account age < 30 days |
| Silver | Account age < 90 days OR score < 300 |
| Gold | Account age >= 90 days AND score >= 300 |

## Claude Code Integration

The project includes a hook for automatic achievement logging:

```bash
# Set environment variables
export AAIP_AGENT_ID="AGENT_0x1234..."
export AAIP_API_URL="http://localhost:3001"

# Hook is in scripts/aaip-hook.js
# Configuration in .claude/settings.json
```

The hook triggers on `create_pull_request` and `merge_pull_request` tool calls.

## Key Files

### Contracts
- `contracts/src/types.cairo` - Agent, Achievement, AgentStats, Tier structs
- `contracts/src/agent_registry.cairo` - Agent registration and lookup
- `contracts/src/achievement_registry.cairo` - Achievement recording

### Server
- `server/src/routes/agents.ts` - GET /api/agents endpoints
- `server/src/routes/logs.ts` - POST /api/logs for MCP logs
- `server/src/routes/webhooks.ts` - GitHub webhook handler
- `server/src/services/score.ts` - Score calculation logic
- `server/src/utils/hash.ts` - Canonical record hashing

### Frontend
- `frontend/src/lib/starknet-provider.tsx` - Starknet wallet config
- `frontend/src/components/TierBadge.tsx` - Bronze/Silver/Gold badges
- `frontend/src/components/ScoreGauge.tsx` - SVG circular gauge
- `frontend/src/app/agents/[id]/page.tsx` - Agent profile page

### Documentation
- `docs/architecture.md` - System architecture overview
- `docs/demo-guide.md` - E2E demo walkthrough

## Environment Variables

### Server (.env)
```env
PORT=3001
GITHUB_TOKEN=ghp_xxx
GITHUB_WEBHOOK_SECRET=xxx
STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
AGENT_REGISTRY_ADDRESS=0x...
ACHIEVEMENT_REGISTRY_ADDRESS=0x...
PRIVATE_KEY=0x...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_ACHIEVEMENT_REGISTRY_ADDRESS=0x...
```

## Reference Documentation

- [Starknet Foundry Book](https://foundry-rs.github.io/starknet-foundry/)
- [Scarb Documentation](https://docs.swmansion.com/scarb/)
- [OpenZeppelin Cairo Contracts](https://github.com/OpenZeppelin/cairo-contracts)
- [Cairo Book](https://www.starknet.io/cairo-book/)
- [starknet.js](https://www.starknetjs.com/)
- [starknet-react](https://starknet-react.com/)
