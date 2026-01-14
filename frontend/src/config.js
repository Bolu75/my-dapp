import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(), // Supports MetaMask, Rabby, Coinbase Wallet, etc.
  ],
  transports: {
    // This safely pulls the URL from your .env file
    [sepolia.id]: http(import.meta.env.VITE_INFURA_URL),
  },
})