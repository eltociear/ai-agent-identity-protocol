# AAIP Deployment Guide

このガイドでは、AAIPをVercel + Railway + Starknet Sepoliaにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- [Vercel](https://vercel.com)アカウント（無料）
- [Railway](https://railway.app)アカウント（無料）
- Starknetウォレット（Argent X または Braavos）
- Sepolia ETH（テストネット用）

## Step 1: Starknet Sepoliaにコントラクトをデプロイ

### 1.1 Sepolia ETHを取得

1. [Starknet Faucet](https://starknet-faucet.vercel.app/)にアクセス
2. ウォレットアドレスを入力
3. ETHを受け取る（数分かかる場合があります）

### 1.2 コントラクトをデプロイ

ローカルでターミナルを開き：

```bash
cd contracts

# ビルド
scarb build

# AgentRegistryをdeclare
sncast --url https://starknet-sepolia.public.blastapi.io \
  --account YOUR_ACCOUNT \
  declare --contract-name AgentRegistry

# AgentRegistryをdeploy
sncast --url https://starknet-sepolia.public.blastapi.io \
  --account YOUR_ACCOUNT \
  deploy --class-hash <AGENT_REGISTRY_CLASS_HASH>

# AchievementRegistryをdeclare
sncast --url https://starknet-sepolia.public.blastapi.io \
  --account YOUR_ACCOUNT \
  declare --contract-name AchievementRegistry

# AchievementRegistryをdeploy（引数にAgentRegistryアドレスと認可アドレス）
sncast --url https://starknet-sepolia.public.blastapi.io \
  --account YOUR_ACCOUNT \
  deploy --class-hash <ACHIEVEMENT_REGISTRY_CLASS_HASH> \
  --constructor-calldata <AGENT_REGISTRY_ADDRESS> <AUTHORIZED_SUBMITTER_ADDRESS>
```

デプロイ後、アドレスをメモしてください。

## Step 2: GitHubにプッシュ

```bash
cd /path/to/ai-agent-identity-protocol
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Step 3: Railway でバックエンドをデプロイ

### 3.1 新規プロジェクト作成

1. [Railway](https://railway.app)にログイン
2. "New Project" → "Deploy from GitHub repo"
3. `ai-agent-identity-protocol`リポジトリを選択
4. **Root Directory**を`server`に設定

### 3.2 環境変数を設定

Railway Dashboard → Variables で以下を追加：

| 変数名 | 値 |
|--------|-----|
| `PORT` | `3001` |
| `GITHUB_TOKEN` | `ghp_xxx...`（GitHub PAT） |
| `STARKNET_RPC_URL` | `https://starknet-sepolia.public.blastapi.io` |
| `AGENT_REGISTRY_ADDRESS` | `0x...`（Step 1でデプロイしたアドレス） |
| `ACHIEVEMENT_REGISTRY_ADDRESS` | `0x...`（Step 1でデプロイしたアドレス） |
| `SERVER_PRIVATE_KEY` | `0x...`（authorized_submitterの秘密鍵） |

### 3.3 デプロイ

"Deploy"をクリック。完了後、URLをメモ（例: `https://aaip-server.railway.app`）

## Step 4: Vercel でフロントエンドをデプロイ

### 4.1 新規プロジェクト作成

1. [Vercel](https://vercel.com)にログイン
2. "Add New..." → "Project"
3. `ai-agent-identity-protocol`リポジトリをインポート
4. **Root Directory**を`frontend`に設定
5. **Framework Preset**: Next.js（自動検出）

### 4.2 環境変数を設定

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_API_URL` | `https://aaip-server.railway.app`（Railway URL） |
| `NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS` | `0x...` |
| `NEXT_PUBLIC_ACHIEVEMENT_REGISTRY_ADDRESS` | `0x...` |

### 4.3 デプロイ

"Deploy"をクリック。完了後、URL（例: `https://aaip.vercel.app`）にアクセス。

## Step 5: 動作確認

1. デプロイされたフロントエンドにアクセス
2. ウォレットを接続（Argent X / Braavos）
3. ネットワークが**Starknet Sepolia**であることを確認
4. `/register`でエージェント登録をテスト

## トラブルシューティング

### Railway: ビルドエラー
```bash
# ローカルでビルドテスト
cd server
npm run build
```

### Vercel: 依存関係エラー
`vercel.json`で`--legacy-peer-deps`が設定されていることを確認。

### Starknet: トランザクション失敗
- Sepolia ETHの残高を確認
- RPC URLが正しいか確認
- コントラクトアドレスが正しいか確認

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Starknet Docs](https://docs.starknet.io/)
