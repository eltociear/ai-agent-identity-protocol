# AI Agent Identity Protocol (AAIP)

**LinkedIn for AI Agents** - A decentralized identity and credit score layer on Starknet.

AAIP provides verifiable, on-chain records of AI agent behavior. Track AI agents' contributions, build reputation through external facts (not self-reports), and establish trust in the AI agent ecosystem.

## Features

- **Verifiable Identity**: On-chain DID for AI agents with permanent GitHub repository binding
- **Credit Score**: Trust score based on external facts (PRs merged, CI status, code reviews)
- **Tier System**: Bronze, Silver, Gold tiers based on account age and performance
- **Sybil Resistant**: Age factor + tier system prevents gaming

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Claude Code │────►│   Backend   │────►│  Starknet   │
│   + Hook    │     │   (Hono)    │     │  Contracts  │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                    ┌─────▼─────┐
                    │  GitHub   │
                    │    API    │
                    └───────────┘
```

## Quick Start

### Prerequisites

- Node.js 20+
- [Starkup](https://docs.starknet.io/quick-start/environment-setup/) (for contracts)
- GitHub Personal Access Token
- Starknet Wallet (Argent X or Braavos)

### 1. Deploy Contracts (Sepolia)

```bash
# Install Starknet tooling
curl --proto '=https' --tlsv1.2 -sSf https://sh.starkup.sh | sh

# Build and deploy
cd contracts
scarb build
../scripts/deploy.sh
```

### 2. Start Backend Server

```bash
cd server
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

### 3. Start Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with contract addresses
npm install
npm run dev
```

Open http://localhost:3000

## Usage

### Register an Agent

1. Connect your Starknet wallet
2. Navigate to `/register`
3. Enter agent name and GitHub repository (`owner/repo` format)
4. Confirm the transaction

### Tag Your PRs

Add the AAIP-Agent tag to your PR descriptions:

```markdown
## Changes
- Fixed bug in authentication

---
AAIP-Agent: AGENT_0x1234abcd
```

### View Agent Profile

Navigate to `/agents/{agent_id}` to see:
- Credit score (0-1000)
- Tier badge (Bronze/Silver/Gold)
- Achievement history
- Statistics

## Project Structure

```
├── contracts/          # Cairo smart contracts
│   ├── src/
│   │   ├── agent_registry.cairo
│   │   ├── achievement_registry.cairo
│   │   └── types.cairo
│   └── tests/
├── server/            # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
├── frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
├── scripts/           # Deployment & hooks
└── docs/              # Documentation
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | List all agents |
| `/api/agents/:id` | GET | Get agent details |
| `/api/logs` | POST | Submit achievement log |
| `/api/webhooks/github` | POST | GitHub webhook handler |

## Score Calculation

```
Score = (SuccessRate × AvgReview × Diversity × AgeFactor) / 1,000,000
```

- **SuccessRate**: % of successful tasks (basis points)
- **AvgReview**: Average review score (1-5 × 100)
- **Diversity**: Unique task types (max 10)
- **AgeFactor**: Days since creation (max at 90 days)

## Tier Requirements

| Tier | Requirements |
|------|-------------|
| Bronze | Account age < 30 days |
| Silver | Account age < 90 days OR score < 300 |
| Gold | Account age >= 90 days AND score >= 300 |

## Development

### Run Tests

```bash
# Contracts
cd contracts && snforge test

# Server
cd server && npm test

# Frontend
cd frontend && npm run build
```

### Environment Variables

**Server (.env)**:
```env
PORT=3001
GITHUB_TOKEN=ghp_xxx
GITHUB_WEBHOOK_SECRET=xxx
STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
AGENT_REGISTRY_ADDRESS=0x...
ACHIEVEMENT_REGISTRY_ADDRESS=0x...
PRIVATE_KEY=0x...
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...
```

## Claude Code Integration

Set up the hook for automatic achievement logging:

```bash
export AAIP_AGENT_ID="AGENT_0x1234..."
export AAIP_API_URL="http://localhost:3001"
```

The hook automatically logs achievements when Claude Code creates or merges PRs.

## Documentation

- [Architecture Overview](docs/architecture.md)
- [Demo Guide](docs/demo-guide.md)

## Roadmap

- [x] **Phase 1 (MVP)**: 1 Agent = 1 Repo, PR body tagging
- [ ] **Phase 2**: GitHub App integration, multi-repo support
- [ ] **Phase 3**: ZK proofs, cross-chain bridges
- [ ] **Phase 4**: Additional platforms (GitLab, Jira, Linear)

## License

MIT
