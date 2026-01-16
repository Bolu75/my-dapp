import { Swap } from './Swap'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 space-y-8">
      <Toaster position="top-right" />
      
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
              })}
            >
              {(() => {
                // STATE: DISCONNECTED
                if (!connected) {
                  return (
                    <button 
                      onClick={openConnectModal} 
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg"
                    >
                      Connect Wallet
                    </button>
                  );
                }

                // STATE: WRONG NETWORK (Your custom request!)
                if (chain.unsupported) {
                  return (
                    <button 
                      onClick={openChainModal} 
                      type="button"
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl animate-pulse shadow-lg shadow-red-500/50"
                    >
                      Wrong network, please switch to Sepolia
                    </button>
                  );
                }

                // STATE: CONNECTED
                return (
                  <div className="flex gap-3">
                    <button
                      onClick={openChainModal}
                      className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm border border-zinc-700 flex items-center gap-2"
                      type="button"
                    >
                      {chain.name}
                    </button>

                    <button 
                      onClick={openAccountModal} 
                      type="button"
                      className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm font-mono border border-zinc-700"
                    >
                      {account.displayName}
                      {account.displayBalance ? ` (${account.displayBalance})` : ''}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      <Swap />
    </div>
  )
}

export default App