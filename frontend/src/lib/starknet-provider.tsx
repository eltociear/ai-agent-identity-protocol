'use client';

import { ReactNode } from 'react';
import { sepolia, mainnet } from '@starknet-react/chains';
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
} from '@starknet-react/core';

interface StarknetProviderProps {
  children: ReactNode;
}

// Create connectors outside the component to avoid re-creation on each render
const connectors = [argent(), braavos()];

export function StarknetProvider({ children }: StarknetProviderProps) {
  return (
    <StarknetConfig
      chains={[sepolia, mainnet]}
      provider={publicProvider()}
      connectors={connectors}
    >
      {children}
    </StarknetConfig>
  );
}
