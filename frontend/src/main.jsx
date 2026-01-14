import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // 👈 ADD THIS LINE!
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://sepolia.infura.io/v3/2ec0c78b6f58447098f00c7690f61129"),
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <App />
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
)