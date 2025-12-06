'use client';

import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { useState } from 'react';

const WALLET_LINKS = {
  argent: 'https://www.argent.xyz/argent-x/',
  braavos: 'https://braavos.app/',
};

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [connectError, setConnectError] = useState<string | null>(null);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const handleConnect = async (connector: (typeof connectors)[number]) => {
    setConnectError(null);
    try {
      await connect({ connector });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      if (message.includes('not installed') || message.includes('not found')) {
        setConnectError(`${connector.name} wallet not installed. Please install it first.`);
      } else {
        setConnectError(message);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => handleConnect(connector)}
            disabled={isPending}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span>Connecting...</span>
            ) : (
              <>
                <span>Connect {connector.name}</span>
                {connector.id === 'argentX' && <span>(formerly Argent)</span>}
              </>
            )}
          </button>
        ))}
      </div>

      {(connectError || error) && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          <p>{connectError || error?.message}</p>
          <p className="mt-2 text-gray-400">
            Install a Starknet wallet:{' '}
            <a
              href={WALLET_LINKS.argent}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Argent X
            </a>{' '}
            or{' '}
            <a
              href={WALLET_LINKS.braavos}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Braavos
            </a>
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        Need a wallet?{' '}
        <a
          href={WALLET_LINKS.argent}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Get Argent X
        </a>{' '}
        or{' '}
        <a
          href={WALLET_LINKS.braavos}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Get Braavos
        </a>
      </p>
    </div>
  );
}
