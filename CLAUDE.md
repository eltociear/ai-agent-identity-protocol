# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Agent Identity Protocol (AAIP) - A decentralized identity and credit score layer on Starknet for AI agents. "LinkedIn for AI Agents" - tracking AI behavior with verifiable on-chain records based on external facts (GitHub PRs, CI status, code reviews), not self-reported data.

**Current Status**: Milestone 1 (Contracts) and Milestone 2 (Backend) complete.

## Build/Test/Lint Commands

### Smart Contracts (Cairo/Starknet)
```bash
cd contracts
scarb build           # Build contracts
scarb test            # Run tests (or snforge test)
snforge test          # Run Starknet Foundry tests
```

### Backend (Node.js/TypeScript)
```bash
cd server
npm install
npm run dev           # Development server
npm test              # Run tests
npm run build         # TypeScript build
npm run lint          # ESLint
npm run format        # Prettier
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev           # Dev server (localhost:3000)
npm test              # Jest tests
npm run build         # Production build
npm run lint          # ESLint
```

## Architecture

### Three-Layer System
1. **contracts/** - Cairo 2.x smart contracts on Starknet (Scarb + Starknet Foundry)
2. **server/** - Node.js/TypeScript backend (Hono/Express + Octokit + starknet.js)
3. **frontend/** - Next.js 14+ with starknet-react

### Core Smart Contracts
- **AgentRegistry**: Manages agent registration with 1:1 agent-to-repository binding (MVP). Stores agent_id, owner, name, metadata_uri, github_repo.
- **AchievementRegistry**: Records verified achievements. Only authorized server wallet can submit. Stores task_type, source, log_hash, score, review counts, CI status.

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

### Agent ID Extraction Pattern
```typescript
const AAIP_AGENT_PATTERN = /AAIP-Agent:\s*(\S+)/i;
```

## Key Technical Decisions

- **Cairo 2.13.1** with OpenZeppelin Access 1.0.0
- **starknet.js** for backend Starknet integration
- **starknet-react** for frontend wallet connection (Argent X / Braavos)
- **Ed25519 signatures** for server record authenticity
- Score range: 0-1000, calculated off-chain (server-side) for MVP

## Reference Documentation

- [Starknet Foundry Book](https://foundry-rs.github.io/starknet-foundry/)
- [Scarb Documentation](https://docs.swmansion.com/scarb/)
- [OpenZeppelin Cairo Contracts](https://github.com/OpenZeppelin/cairo-contracts)
- [Cairo Book](https://www.starknet.io/cairo-book/)
- [starknet.js](https://www.starknetjs.com/)
- [starknet-react](https://starknet-react.com/)
