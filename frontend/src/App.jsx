import { Swap } from './Swap'
import { ConnectWallet } from './ConnectWallet'

function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 space-y-8">
      {/* 1. Wallet connection at the top */}
      <ConnectWallet />

      {/* 2. Your Triple-Tab Swap Card (Swap, Faucet, and History are all in here now) */}
      <Swap />
    </div>
  )
}

export default App