import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const config = getDefaultConfig({
  appName: 'Bolu AMM',
  projectId: '0a7a49d9243345b27134cc6833e29672',
  chains: [sepolia],
  // This flag improves wallet discovery on mobile browsers
  multiInjectedProviderDiscovery: true, 
  transports: {
    [sepolia.id]: http("https://sepolia.infura.io/v3/2ec0c78b6f58447098f00c7690f61129"),
  },
  ssr: false, 
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} coolMode showRecentTransactions={true}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)