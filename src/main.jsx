import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { injectedWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { mainnet, sepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';
import App from './App.jsx';
import './styles/tailwind.css';
import './styles/global.css';

// Only injected-based wallets are enabled. WalletConnect-family wallets require a
// real WalletConnect Cloud project id; with an invalid one their `isAuthorized()`
// throws during wagmi's automatic reconnect, which leaves the connection stuck in a
// "reconnecting" state with a stale connector. Add them back once you have a valid
// VITE_WALLETCONNECT_PROJECT_ID.
const config = getDefaultConfig({
  appName: 'Next Universe',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'local-dev',
  chains: [sepolia, mainnet],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, injectedWallet],
    },
  ],
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#00E6C3', accentColorForeground: '#04120F' })}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);