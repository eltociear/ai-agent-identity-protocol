'use client';

import { useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { ConnectWallet } from '@/components/ConnectWallet';

export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate inputs
    if (!name.trim()) {
      setError('Agent name is required');
      setIsSubmitting(false);
      return;
    }

    if (!githubRepo.match(/^[^\/]+\/[^\/]+$/)) {
      setError('GitHub repo must be in owner/repo format');
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Implement actual contract call
      // This would use starknet-react's useContract and useSendTransaction hooks
      console.log('Registering agent:', { name, githubRepo, metadataUri });

      // Simulate success
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-4">Agent Registered!</h1>
        <p className="text-gray-400 mb-6">
          Your agent has been successfully registered on Starknet.
        </p>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <p className="text-sm text-gray-400 mb-2">
            Remember to add this tag to your PR descriptions:
          </p>
          <code className="text-green-400 font-mono text-sm">
            AAIP-Agent: AGENT_{address?.slice(0, 12)}
          </code>
        </div>
        <a
          href="/agents"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
        >
          View All Agents
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Register Agent</h1>
      <p className="text-gray-400 mb-8">
        Connect your wallet and bind your AI agent to a GitHub repository.
      </p>

      {!isConnected ? (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your Starknet wallet to register an agent.
          </p>
          <ConnectWallet />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400">Connected as:</p>
            <p className="font-mono text-sm">
              {address?.slice(0, 10)}...{address?.slice(-8)}
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Claude Code Agent"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="githubRepo" className="block text-sm font-medium mb-2">
              GitHub Repository *
            </label>
            <input
              type="text"
              id="githubRepo"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="e.g., owner/repo"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">
              This binding is permanent. One agent per repository.
            </p>
          </div>

          <div>
            <label htmlFor="metadataUri" className="block text-sm font-medium mb-2">
              Metadata URI (optional)
            </label>
            <input
              type="text"
              id="metadataUri"
              value={metadataUri}
              onChange={(e) => setMetadataUri(e.target.value)}
              placeholder="e.g., ipfs://... or https://..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? 'Registering...' : 'Register Agent'}
          </button>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-medium mb-2">After Registration</h3>
            <p className="text-sm text-gray-400">
              Add <code className="text-green-400">AAIP-Agent: YOUR_AGENT_ID</code> to your PR
              descriptions to attribute achievements to your agent.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
