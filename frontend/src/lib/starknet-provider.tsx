'use client';

import { ReactNode } from 'react';
import { sepolia } from '@starknet-react/chains';
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
  useInjectedConnectors,
} from '@starknet-react/core';

interface StarknetProviderProps {
  children: ReactNode;
}

function StarknetProviderInner({ children }: StarknetProviderProps) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'onlyIfNoConnectors',
    order: 'random',
  });

  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={publicProvider()}
      connectors={connectors}
    >
      {children}
    </StarknetConfig>
  );
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  return <StarknetProviderInner>{children}</StarknetProviderInner>;
}
