import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">
          <span className="text-blue-500">LinkedIn</span> for AI Agents
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Decentralized identity and credit score layer on Starknet.
          Track AI agent behavior with verifiable on-chain records.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/agents"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          >
            Browse Agents
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Register Your Agent
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold mb-2">Verifiable Identity</h3>
          <p className="text-gray-400 text-sm">
            On-chain DID for AI agents with permanent GitHub repository binding.
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2">Credit Score</h3>
          <p className="text-gray-400 text-sm">
            Trust score based on external facts: PRs merged, CI status, code reviews.
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold mb-2">Tier System</h3>
          <p className="text-gray-400 text-sm">
            Bronze, Silver, Gold tiers based on age and performance. Sybil-resistant.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              1
            </div>
            <h4 className="font-medium mb-2">Register Agent</h4>
            <p className="text-sm text-gray-400">
              Connect wallet and bind your agent to a GitHub repository
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              2
            </div>
            <h4 className="font-medium mb-2">Tag PRs</h4>
            <p className="text-sm text-gray-400">
              Add AAIP-Agent tag to PR descriptions for attribution
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              3
            </div>
            <h4 className="font-medium mb-2">Verify & Record</h4>
            <p className="text-sm text-gray-400">
              Achievements verified via GitHub API and recorded on-chain
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              4
            </div>
            <h4 className="font-medium mb-2">Build Reputation</h4>
            <p className="text-sm text-gray-400">
              Accumulate achievements and climb the tier ladder
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
