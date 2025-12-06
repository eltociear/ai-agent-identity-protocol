#!/bin/bash

# AAIP Contract Deployment Script for Starknet Sepolia
#
# Prerequisites:
#   - Starknet CLI (starkli) installed
#   - Account deployed on Sepolia
#   - Environment variables set (see below)
#
# Required environment variables:
#   STARKNET_ACCOUNT - Path to account JSON file
#   STARKNET_KEYSTORE - Path to keystore file
#   AUTHORIZED_SUBMITTER - Server wallet address for AchievementRegistry

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== AAIP Contract Deployment ===${NC}"
echo ""

# Check prerequisites
if ! command -v starkli &> /dev/null; then
    echo -e "${RED}Error: starkli not found. Install it with 'starkup'${NC}"
    exit 1
fi

if ! command -v scarb &> /dev/null; then
    echo -e "${RED}Error: scarb not found. Install it with 'starkup'${NC}"
    exit 1
fi

# Check environment variables
if [ -z "$STARKNET_ACCOUNT" ]; then
    echo -e "${YELLOW}Warning: STARKNET_ACCOUNT not set${NC}"
    echo "You can set it with: export STARKNET_ACCOUNT=~/.starkli-wallets/deployer/account.json"
fi

if [ -z "$STARKNET_KEYSTORE" ]; then
    echo -e "${YELLOW}Warning: STARKNET_KEYSTORE not set${NC}"
    echo "You can set it with: export STARKNET_KEYSTORE=~/.starkli-wallets/deployer/keystore.json"
fi

if [ -z "$AUTHORIZED_SUBMITTER" ]; then
    echo -e "${YELLOW}Warning: AUTHORIZED_SUBMITTER not set${NC}"
    echo "This should be the server wallet address that will submit achievements"
    echo "Using deployer address as fallback"
fi

# Navigate to contracts directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../contracts"

echo -e "${GREEN}Building contracts...${NC}"
scarb build

# Check if build succeeded
if [ ! -d "target/dev" ]; then
    echo -e "${RED}Build failed: target/dev not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Contract artifacts:${NC}"
ls -la target/dev/*.contract_class.json 2>/dev/null || echo "No contract class files found"

# Declare contracts
echo ""
echo -e "${GREEN}Declaring AgentRegistry...${NC}"
AGENT_REGISTRY_CLASS_HASH=$(starkli declare \
    --network sepolia \
    target/dev/contracts_AgentRegistry.contract_class.json \
    2>&1 | grep -oP '0x[a-fA-F0-9]+' | head -1)

if [ -z "$AGENT_REGISTRY_CLASS_HASH" ]; then
    echo -e "${YELLOW}AgentRegistry may already be declared, checking...${NC}"
    # Try to get the class hash from the Sierra file
    AGENT_REGISTRY_CLASS_HASH=$(starkli class-hash target/dev/contracts_AgentRegistry.contract_class.json)
fi

echo "AgentRegistry class hash: $AGENT_REGISTRY_CLASS_HASH"

echo ""
echo -e "${GREEN}Declaring AchievementRegistry...${NC}"
ACHIEVEMENT_REGISTRY_CLASS_HASH=$(starkli declare \
    --network sepolia \
    target/dev/contracts_AchievementRegistry.contract_class.json \
    2>&1 | grep -oP '0x[a-fA-F0-9]+' | head -1)

if [ -z "$ACHIEVEMENT_REGISTRY_CLASS_HASH" ]; then
    echo -e "${YELLOW}AchievementRegistry may already be declared, checking...${NC}"
    ACHIEVEMENT_REGISTRY_CLASS_HASH=$(starkli class-hash target/dev/contracts_AchievementRegistry.contract_class.json)
fi

echo "AchievementRegistry class hash: $ACHIEVEMENT_REGISTRY_CLASS_HASH"

# Deploy contracts
echo ""
echo -e "${GREEN}Deploying AgentRegistry...${NC}"
AGENT_REGISTRY_ADDRESS=$(starkli deploy \
    --network sepolia \
    "$AGENT_REGISTRY_CLASS_HASH" \
    2>&1 | grep -oP '0x[a-fA-F0-9]+' | tail -1)

echo "AgentRegistry deployed at: $AGENT_REGISTRY_ADDRESS"

# Get deployer address for AchievementRegistry owner
DEPLOYER_ADDRESS=$(starkli account fetch --network sepolia 2>&1 | grep -oP '0x[a-fA-F0-9]+' | head -1 || echo "")

if [ -z "$AUTHORIZED_SUBMITTER" ]; then
    AUTHORIZED_SUBMITTER="$DEPLOYER_ADDRESS"
fi

echo ""
echo -e "${GREEN}Deploying AchievementRegistry...${NC}"
echo "Using authorized submitter: $AUTHORIZED_SUBMITTER"
ACHIEVEMENT_REGISTRY_ADDRESS=$(starkli deploy \
    --network sepolia \
    "$ACHIEVEMENT_REGISTRY_CLASS_HASH" \
    "$AGENT_REGISTRY_ADDRESS" \
    "$AUTHORIZED_SUBMITTER" \
    2>&1 | grep -oP '0x[a-fA-F0-9]+' | tail -1)

echo "AchievementRegistry deployed at: $ACHIEVEMENT_REGISTRY_ADDRESS"

# Output summary
echo ""
echo -e "${GREEN}=== Deployment Summary ===${NC}"
echo ""
echo "Network: Starknet Sepolia"
echo ""
echo "AgentRegistry:"
echo "  Class Hash: $AGENT_REGISTRY_CLASS_HASH"
echo "  Address: $AGENT_REGISTRY_ADDRESS"
echo ""
echo "AchievementRegistry:"
echo "  Class Hash: $ACHIEVEMENT_REGISTRY_CLASS_HASH"
echo "  Address: $ACHIEVEMENT_REGISTRY_ADDRESS"
echo ""
echo -e "${GREEN}=== Environment Variables ===${NC}"
echo ""
echo "Add these to your .env files:"
echo ""
echo "# Server (.env)"
echo "AGENT_REGISTRY_ADDRESS=$AGENT_REGISTRY_ADDRESS"
echo "ACHIEVEMENT_REGISTRY_ADDRESS=$ACHIEVEMENT_REGISTRY_ADDRESS"
echo ""
echo "# Frontend (.env.local)"
echo "NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=$AGENT_REGISTRY_ADDRESS"
echo "NEXT_PUBLIC_ACHIEVEMENT_REGISTRY_ADDRESS=$ACHIEVEMENT_REGISTRY_ADDRESS"
echo ""

# Save deployment info
DEPLOYMENT_FILE="$SCRIPT_DIR/../deployments/sepolia.json"
mkdir -p "$(dirname "$DEPLOYMENT_FILE")"

cat > "$DEPLOYMENT_FILE" << EOF
{
  "network": "sepolia",
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": {
    "AgentRegistry": {
      "classHash": "$AGENT_REGISTRY_CLASS_HASH",
      "address": "$AGENT_REGISTRY_ADDRESS"
    },
    "AchievementRegistry": {
      "classHash": "$ACHIEVEMENT_REGISTRY_CLASS_HASH",
      "address": "$ACHIEVEMENT_REGISTRY_ADDRESS",
      "constructor": {
        "agentRegistryAddress": "$AGENT_REGISTRY_ADDRESS",
        "authorizedSubmitter": "$AUTHORIZED_SUBMITTER"
      }
    }
  }
}
EOF

echo -e "${GREEN}Deployment info saved to: $DEPLOYMENT_FILE${NC}"
