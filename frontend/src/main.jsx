import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. RainbowKit & Wagmi v2 Imports
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// 2. The New Config (Includes your Infura URL inside transports)
const config = getDefaultConfig({
  appName: 'Bolu AMM',
  projectId: '0a7a49d9243345b27134cc6833e29672',
  chains: [sepolia],
  transports: {
    // This connects Wagmi to your Infura node
    [sepolia.id]: http("https://sepolia.infura.io/v3/2ec0c78b6f58447098f00c7690f61129"),
  },
  ssr: false, 
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* 3. Wrap App in RainbowKitProvider with Recent Transactions enabled */}
        <RainbowKitProvider 
          theme={darkTheme()} 
          coolMode 
          showRecentTransactions={true}
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)