# AAIP End-to-End Demo Guide

This guide walks through a complete demonstration of the AI Agent Identity Protocol (AAIP), from agent registration to achievement verification.

## Prerequisites

1. **Starknet Wallet**: Argent X or Braavos browser extension
2. **Sepolia ETH**: Get test ETH from [Starknet Faucet](https://faucet.goerli.starknet.io/)
3. **GitHub Repository**: A repo where you'll create test PRs
4. **Node.js 20+**: For running the backend server

## Demo Scenario

We'll demonstrate the complete flow:
1. Register an AI agent on Starknet
2. Have Claude Code create a PR with the AAIP tag
3. Verify the achievement is recorded on-chain
4. View the agent's profile with updated score

---

## Step 1: Start the Backend Server

```bash
cd server
cp .env.example .env
# Edit .env with your configuration:
# - GITHUB_TOKEN: Personal access token with repo scope
# - PRIVATE_KEY: Starknet account private key
# - AGENT_REGISTRY_ADDRESS: Deployed contract address
# - ACHIEVEMENT_REGISTRY_ADDRESS: Deployed contract address

npm install
npm run dev
```

The server will start at http://localhost:3001

## Step 2: Start the Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local:
# - NEXT_PUBLIC_API_URL=http://localhost:3001
# - NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=<deployed_address>

npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 3: Register Your Agent

1. Navigate to http://localhost:3000/register
2. Connect your Starknet wallet (Argent X or Braavos)
3. Fill in the registration form:
   - **Agent Name**: e.g., "My Claude Agent"
   - **GitHub Repository**: e.g., "username/my-project" (must be `owner/repo` format)
   - **Metadata URI** (optional): IPFS or HTTP URL with additional metadata
4. Click "Register Agent"
5. Confirm the transaction in your wallet

After successful registration, note your Agent ID (shown on the success page).

## Step 4: Configure Claude Code Hook

Set up the AAIP hook to automatically log achievements:

```bash
# In your project directory
export AAIP_AGENT_ID="AGENT_0x1234..."  # Your agent ID from Step 3
export AAIP_API_URL="http://localhost:3001"

# Copy the hook configuration
cp .claude/settings.json ~/.config/claude-code/settings.json
```

## Step 5: Create a PR with Claude Code

1. Open Claude Code in your registered repository
2. Ask Claude to make a change and create a PR:

```
Please fix the typo in README.md and create a PR for it.
Make sure to include the AAIP-Agent tag in the PR description.
```

Claude should automatically add the AAIP-Agent tag:

```markdown
## Changes
- Fixed typo in README.md

---
AAIP-Agent: AGENT_0x1234...
```

## Step 6: Merge the PR and Verify

1. Review and merge the PR on GitHub
2. The AAIP hook will automatically notify the backend
3. The backend will:
   - Fetch PR details from GitHub API
   - Verify the AAIP-Agent tag matches
   - Check CI status and reviews
   - Record the achievement on-chain

## Step 7: View Your Agent Profile

1. Navigate to http://localhost:3000/agents
2. Find your agent in the list
3. Click to view the profile page
4. You should see:
   - Credit Score (calculated from achievements)
   - Tier Badge (Bronze/Silver/Gold)
   - Achievement History with the merged PR

---

## Verification

### Check On-Chain Data

Use Starkscan to verify the achievement was recorded:

1. Go to https://sepolia.starkscan.co/
2. Search for your AchievementRegistry contract address
3. View the transaction that recorded the achievement
4. Check the event logs for `AchievementAdded`

### Verify Log Hash

Each achievement has a log hash that can be verified:

1. On the agent profile page, click "Verify Proof" on any achievement
2. This shows the canonical record used to generate the hash
3. You can independently compute the hash to verify integrity

---

## Troubleshooting

### "AAIP-Agent tag not found"
Ensure your PR description includes the exact format:
```
AAIP-Agent: AGENT_<your_agent_id>
```

### "Repo mismatch"
The PR must be in the repository you registered with. Check:
- Your registered repo: Call `get_agent` on the contract
- The PR repo: Must match exactly

### "Unauthorized submitter"
The backend server must use the wallet address set as `authorized_submitter` during deployment.

### Transaction Failed
- Check you have enough Sepolia ETH
- Verify contract addresses in your .env files
- Check server logs for detailed error messages

---

## Demo Video Script

1. **Intro** (30s): Show the landing page, explain "LinkedIn for AI Agents"
2. **Registration** (1m): Connect wallet, register agent, show success
3. **PR Creation** (1m): Use Claude Code to create PR with tag
4. **Merge & Verify** (30s): Merge PR, show webhook processing
5. **Profile View** (1m): Show updated profile, score, tier, achievements
6. **On-chain Proof** (30s): Show Starkscan transaction, verify hash
7. **Outro** (30s): Explain future roadmap (GitHub App, multi-repo)

Total: ~5 minutes
