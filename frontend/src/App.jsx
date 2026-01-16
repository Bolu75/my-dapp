import { Swap } from './Swap'
import { ConnectButton } from '@rainbow-me/rainbowkit' // 👈 Import the new button

function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 space-y-8">
      {/* 1. Use the professional ConnectButton here */}
      <ConnectButton />

      {/* 2. Your Triple-Tab Swap Cards */}
      <Swap />
    </div>
  )
}

export default App