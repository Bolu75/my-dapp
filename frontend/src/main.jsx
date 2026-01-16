import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import '@rainbow-me/rainbowkit/styles.css'
import { 
  connectorsForWallets, 
  RainbowKitProvider, 
  darkTheme 
} from '@rainbow-me/rainbowkit'
import { 
  metaMaskWallet, 
  walletConnectWallet, 
  rainbowWallet 
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig, WagmiProvider, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
const projectId = '0a7a49d9243345b27134cc6833e29672'

// ⚡ This is the "Big App" way to define connectors. 
// It ensures that if the app is inside the MetaMask browser, it uses the "Injected" logic first.
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet({ projectId, chains: [sepolia] }),
        rainbowWallet({ projectId, chains: [sepolia] }),
        walletConnectWallet({ projectId, chains: [sepolia] }),
      ],
    },
  ],
  {
    appName: 'Bolu AMM',
    projectId,
  }
)

const config = createConfig({
  connectors,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://sepolia.infura.io/v3/2ec0c78b6f58447098f00c7690f61129"),
  },
  ssr: false, 
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} coolMode>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)