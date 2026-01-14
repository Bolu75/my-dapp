import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, ExternalLink, ChevronDown, ShieldCheck, Circle } from 'lucide-react'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [isOpen, setIsOpen] = useState(false)

  const shortenAddress = (addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`

  if (!isConnected) {
    return (
      <div className="flex gap-3 animate-in fade-in duration-500">
        {connectors.map((connector) => (
          <Button 
            key={connector.uid}
            onClick={() => connect({ connector })}
            className="rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Connect {connector.name}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="relative flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Network Indicator */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse border-none" />
        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sepolia</span>
      </div>

      {/* Manual Dropdown Wrapper */}
      <div className="relative">
        <Button 
          onClick={() => setIsOpen(!isOpen)}
          variant="outline" 
          className="rounded-full pl-2 pr-4 py-6 bg-card/40 backdrop-blur-xl border-border/50 hover:bg-muted/50 transition-all shadow-xl flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-inner">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col items-start">
            {/* UPDATED: LABEL IS NOW GREEN AND SAYS CONNECTED */}
            <span className="text-[9px] text-emerald-500 uppercase font-black leading-none mb-1">
              Connected
            </span>
            <span className="text-sm font-mono font-bold leading-none">{shortenAddress(address)}</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* The Dropdown Menu */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <div className="absolute right-0 mt-2 w-60 bg-card/90 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 flex items-center gap-3 border-b border-border/50">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-tight">Verified Session</span>
              </div>
              
              <div className="p-2">
                <button 
                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  View on Explorer
                </button>
                
                <button 
                  onClick={() => {
                    disconnect()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-sm font-bold"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}