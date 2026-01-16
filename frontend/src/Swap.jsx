import { useState, useEffect } from 'react'
import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { 
  AMM_ADDRESS, AMM_ABI, 
  TOKEN_A_ADDRESS, TOKEN_B_ADDRESS, 
  TOKEN_ABI 
} from './constants'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function Swap() {
  const { address, isConnected } = useAccount()
  
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState('AtoB')
  const [liqAmountA, setLiqAmountA] = useState('')
  const [liqAmountB, setLiqAmountB] = useState('')
  const [history, setHistory] = useState([])

  const activeToken = direction === 'AtoB' ? TOKEN_A_ADDRESS : TOKEN_B_ADDRESS
  const tokenSymbol = direction === 'AtoB' ? 'DAI' : 'USDC'
  const targetSymbol = direction === 'AtoB' ? 'USDC' : 'DAI'

  // --- 1. DATA READS (With safety enabled: isConnected) ---
  const { data: balanceA, refetch: refetchBalA } = useReadContract({
    address: TOKEN_A_ADDRESS, abi: TOKEN_ABI, functionName: 'balanceOf', args: [address],
    query: { enabled: !!address && isConnected }
  })
  const { data: balanceB, refetch: refetchBalB } = useReadContract({
    address: TOKEN_B_ADDRESS, abi: TOKEN_ABI, functionName: 'balanceOf', args: [address],
    query: { enabled: !!address && isConnected } 
  })
  const { data: allowanceA, refetch: refetchAllowA } = useReadContract({
    address: TOKEN_A_ADDRESS, abi: TOKEN_ABI, functionName: 'allowance', args: [address, AMM_ADDRESS],
    query: { enabled: !!address && isConnected }
  })
  const { data: allowanceB, refetch: refetchAllowB } = useReadContract({
    address: TOKEN_B_ADDRESS, abi: TOKEN_ABI, functionName: 'allowance', args: [address, AMM_ADDRESS],
    query: { enabled: !!address && isConnected }
  })

  // --- 2. CONTRACT WRITES ---
  const { data: hash, writeContract, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // --- 3. AUTO-REFRESH & SUCCESS LOGIC ---
  useEffect(() => { 
    if (isConfirmed && hash) {
      refetchAllowA(); refetchAllowB();
      refetchBalA(); refetchBalB();
      
      const newEntry = {
        id: hash,
        type: amount ? `Swapped ${amount} ${tokenSymbol}` : "Pool Updated",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setHistory(prev => [newEntry, ...prev].slice(0, 10))
      setAmount(''); setLiqAmountA(''); setLiqAmountB('');
      reset(); 
    } 
  }, [isConfirmed, hash])

  // --- 4. HANDLERS ---
  const handleSwap = () => {
    if (!amount) return
    const val = parseUnits(amount, 18)
    const allowance = direction === 'AtoB' ? allowanceA : allowanceB
    
    if (allowance < val) {
      writeContract({ address: activeToken, abi: TOKEN_ABI, functionName: 'approve', args: [AMM_ADDRESS, val] })
    } else {
      writeContract({
        address: AMM_ADDRESS, abi: AMM_ABI,
        functionName: direction === 'AtoB' ? 'swapAforB' : 'swapBforA',
        args: [val]
      })
    }
  }

  const handleAddLiquidity = () => {
    const pA = parseUnits(liqAmountA || '0', 18); 
    const pB = parseUnits(liqAmountB || '0', 18)
    if (allowanceA < pA) {
      writeContract({ address: TOKEN_A_ADDRESS, abi: TOKEN_ABI, functionName: 'approve', args: [AMM_ADDRESS, pA] })
    } else if (allowanceB < pB) {
      writeContract({ address: TOKEN_B_ADDRESS, abi: TOKEN_ABI, functionName: 'approve', args: [AMM_ADDRESS, pB] })
    } else {
      writeContract({ address: AMM_ADDRESS, abi: AMM_ABI, functionName: 'addLiquidity', args: [pA, pB] })
    }
  }

  const formatBal = (v) => v ? parseFloat(formatUnits(v, 18)).toFixed(2) : '0.00'

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">StableSwap</CardTitle>
            <div className="flex items-center gap-2">
               <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
               <div className="text-[10px] text-muted-foreground font-mono uppercase">Sepolia</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="swap" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 p-1">
              <TabsTrigger value="swap">Swap</TabsTrigger>
              <TabsTrigger value="liquidity">Pool</TabsTrigger>
              <TabsTrigger value="faucet">Faucet</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* SWAP TAB */}
            <TabsContent value="swap" className="space-y-4 min-h-[400px]">
              <div className="p-4 rounded-2xl bg-muted/30 border border-transparent">
                <div className="flex justify-between text-[10px] text-muted-foreground font-bold mb-2 uppercase">
                  <span>Pay</span>
                  <span>Bal: {direction === 'AtoB' ? formatBal(balanceA) : formatBal(balanceB)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent border-none text-3xl font-semibold p-0 h-auto focus-visible:ring-0" />
                  <div className="bg-background px-3 py-1 rounded-full text-sm font-bold shadow-sm">{tokenSymbol}</div>
                </div>
              </div>

              {/* Direction Toggle */}
              <div className="flex justify-center -my-6 relative z-10">
                 <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl shadow-md bg-background" onClick={() => setDirection(direction === 'AtoB' ? 'BtoA' : 'AtoB')}>⇅</Button>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-transparent">
                <div className="flex justify-between text-[10px] text-muted-foreground font-bold mb-2 uppercase">
                  <span>Receive</span>
                  <span>Bal: {direction === 'AtoB' ? formatBal(balanceB) : formatBal(balanceA)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-semibold opacity-50">{amount || '0.0'}</div>
                  <div className="bg-background px-3 py-1 rounded-full text-sm font-bold shadow-sm">{targetSymbol}</div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button className="w-full py-7 text-lg font-bold rounded-2xl transition-all active:scale-95" disabled={isPending || isConfirming || !amount} onClick={handleSwap}>
                  {isPending ? "Waiting for Wallet..." : isConfirming ? "Confirming..." : (direction === 'AtoB' ? allowanceA : allowanceB) < parseUnits(amount || '0', 18) ? "Approve" : "Swap"}
                </Button>
                
                {isPending && (
                  <p className="text-[11px] text-center text-blue-400 animate-pulse underline cursor-pointer" onClick={() => window.location.href = `https://metamask.app.link/dapp/${window.location.host}`}>
                    Metamask not opening? Tap to wake it up.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* POOL TAB */}
            <TabsContent value="liquidity" className="space-y-4 min-h-[400px]">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">DAI Amount</span>
                  <Input type="number" placeholder="0.0" value={liqAmountA} onChange={(e) => setLiqAmountA(e.target.value)} className="bg-transparent border-none text-xl p-0 h-auto focus-visible:ring-0" />
                </div>
                <div className="p-4 rounded-xl bg-muted/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">USDC Amount</span>
                  <Input type="number" placeholder="0.0" value={liqAmountB} onChange={(e) => setLiqAmountB(e.target.value)} className="bg-transparent border-none text-xl p-0 h-auto focus-visible:ring-0" />
                </div>
                <Button className="w-full py-7 text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700" onClick={handleAddLiquidity} disabled={isPending || !liqAmountA}>
                  {isPending ? "Check Wallet..." : "Add Liquidity"}
                </Button>
              </div>
              {isConfirmed && <Alert className="bg-emerald-500/10 border-emerald-500/50 text-emerald-500"><AlertDescription className="text-center font-bold">Pool Updated! ✅</AlertDescription></Alert>}
            </TabsContent>

            {/* FAUCET TAB */}
            <TabsContent value="faucet" className="space-y-4 min-h-[400px]">
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button variant="outline" className="py-12 flex flex-col gap-2 rounded-2xl border-dashed" onClick={() => writeContract({ address: TOKEN_A_ADDRESS, abi: TOKEN_ABI, functionName: 'mint', args: [address, parseUnits("1000", 18)] })}>
                  <span className="text-[10px] uppercase opacity-50 font-bold">DAI</span>
                  <span className="font-bold">Mint 1,000</span>
                </Button>
                <Button variant="outline" className="py-12 flex flex-col gap-2 rounded-2xl border-dashed" onClick={() => writeContract({ address: TOKEN_B_ADDRESS, abi: TOKEN_ABI, functionName: 'mint', args: [address, parseUnits("1000", 18)] })}>
                  <span className="text-[10px] uppercase opacity-50 font-bold">USDC</span>
                  <span className="font-bold">Mint 1,000</span>
                </Button>
              </div>
            </TabsContent>

            {/* HISTORY TAB */}
            <TabsContent value="history" className="space-y-2 min-h-[400px]">
              {history.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground text-sm italic opacity-50">No activity yet</div>
              ) : (
                history.map(tx => (
                  <div key={tx.id} className="p-4 rounded-xl bg-muted/20 border border-border flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold">{tx.type}</span>
                      <span className="opacity-50">{tx.time}</span>
                    </div>
                    <a href={`https://sepolia.etherscan.io/tx/${tx.id}`} target="_blank" className="text-primary font-bold hover:underline">VIEW SCAN ↗</a>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}