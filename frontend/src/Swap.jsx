import { useState, useEffect } from 'react'
import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { 
  AMM_ADDRESS, AMM_ABI, 
  TOKEN_A_ADDRESS, TOKEN_B_ADDRESS, 
  TOKEN_ABI 
} from './constants'

// Shadcn UI Imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function Swap() {
  const { address } = useAccount()
  
  // States
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState('AtoB')
  const [liqAmountA, setLiqAmountA] = useState('')
  const [liqAmountB, setLiqAmountB] = useState('')
  const [history, setHistory] = useState([])

  const activeToken = direction === 'AtoB' ? TOKEN_A_ADDRESS : TOKEN_B_ADDRESS
  const tokenSymbol = direction === 'AtoB' ? 'DAI' : 'USDC'
  const targetSymbol = direction === 'AtoB' ? 'USDC' : 'DAI'

  // --- 1. BALANCES & ALLOWANCES ---
  const { data: balanceA, refetch: refetchBalA } = useReadContract({
    address: TOKEN_A_ADDRESS, abi: TOKEN_ABI, functionName: 'balanceOf', args: [address],
    query: { refetchInterval: 5000 }
  })
  const { data: balanceB, refetch: refetchBalB } = useReadContract({
    address: TOKEN_B_ADDRESS, abi: TOKEN_ABI, functionName: 'balanceOf', args: [address],
    query: { refetchInterval: 5000 } 
  })
  const { data: allowanceA, refetch: refetchAllowA } = useReadContract({
    address: TOKEN_A_ADDRESS, abi: TOKEN_ABI, functionName: 'allowance', args: [address, AMM_ADDRESS]
  })
  const { data: allowanceB, refetch: refetchAllowB } = useReadContract({
    address: TOKEN_B_ADDRESS, abi: TOKEN_ABI, functionName: 'allowance', args: [address, AMM_ADDRESS]
  })

  // HELPER FOR UNIFORM FORMATTING (Rounded to 2 DP)
  const formatBalance = (val) => {
    if (!val) return '0.00';
    return parseFloat(formatUnits(val, 18)).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  const formattedBalance = direction === 'AtoB' ? formatBalance(balanceA) : formatBalance(balanceB);

  // --- 2. SWAP ESTIMATION LOGIC ---
  const feePercent = 0.3; 
  const feeAmount = amount ? (parseFloat(amount) * (feePercent / 100)).toFixed(4) : '0.0000';
  const estimatedReceive = amount ? (parseFloat(amount) - parseFloat(feeAmount)).toFixed(4) : '0.0000';

  // --- 3. CONTRACT INTERACTIONS ---
  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // --- 4. SUCCESS UPDATES ---
  useEffect(() => { 
    if (isConfirmed && hash) {
      refetchAllowA(); refetchAllowB();
      refetchBalA(); refetchBalB();
      
      const newEntry = {
        id: hash,
        type: 'Transaction Confirmed',
        amount: amount || `${liqAmountA}/${liqAmountB}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setHistory(prev => [newEntry, ...prev].slice(0, 10))
      setAmount(''); setLiqAmountA(''); setLiqAmountB('');
    } 
  }, [isConfirmed, hash])

  // --- 5. ACTION HANDLERS ---
  const handleSwap = () => {
    const parsedAmount = parseUnits(amount, 18)
    const currentAllowance = direction === 'AtoB' ? allowanceA : allowanceB
    if (currentAllowance < parsedAmount) {
      writeContract({ address: activeToken, abi: TOKEN_ABI, functionName: 'approve', args: [AMM_ADDRESS, parsedAmount] })
    } else {
      writeContract({
        address: AMM_ADDRESS, abi: AMM_ABI,
        functionName: direction === 'AtoB' ? 'swapAforB' : 'swapBforA',
        args: [parsedAmount]
      })
    }
  }

  const handleAddLiquidity = () => {
    const pA = parseUnits(liqAmountA, 18); const pB = parseUnits(liqAmountB, 18)
    if (allowanceA < pA) {
      writeContract({ address: TOKEN_A_ADDRESS, abi: TOKEN_ABI, functionName: 'approve', args: [AMM_ADDRESS, pA] })
    } else if (allowanceB < pB) {
      writeContract({ address: TOKEN_B_ADDRESS, abi: TOKEN_ABI, functionName: 'approve', args: [AMM_ADDRESS, pB] })
    } else {
      writeContract({ address: AMM_ADDRESS, abi: AMM_ABI, functionName: 'addLiquidity', args: [pA, pB] })
    }
  }

  const TAB_MIN_HEIGHT = "min-h-[480px]" 

  return (
    <div className="flex flex-col items-center justify-center p-0" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-xl shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">StableSwap</CardTitle>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">Sepolia Live</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* WELCOME ONBOARDING NOTE */}
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-700">
            <p className="text-[11px] leading-relaxed text-muted-foreground uppercase tracking-tight text-center">
              Welcome! First, Go to <span className="text-primary font-bold">faucet</span> to mint test DAI & USDC, 
              then go to <span className="text-primary font-bold">pool</span> to deposit liquidity, 
              then Go to <span className="text-primary font-bold">swap</span> to test the exchange.
            </p>
          </div>

          <Tabs defaultValue="swap" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 p-1">
              <TabsTrigger value="swap">Swap</TabsTrigger>
              <TabsTrigger value="liquidity">Pool</TabsTrigger>
              <TabsTrigger value="faucet">Faucet</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* --- TAB 1: SWAP --- */}
            <TabsContent value="swap" className={`space-y-4 ${TAB_MIN_HEIGHT} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className="group p-4 rounded-2xl bg-muted/30 border border-transparent focus-within:border-primary/20 transition-all">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">
                  <span>Selling</span>
                  <span>Balance: <span className="text-foreground">{formattedBalance}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent border-none text-3xl font-semibold focus-visible:ring-0 p-0 h-auto" />
                  <div className="bg-background border border-border px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                    <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${direction === 'AtoB' ? 'bg-yellow-500' : 'bg-blue-600'}`} />
                    <span className="font-bold text-sm">{tokenSymbol}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-6 relative z-10">
                 <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-background border-border hover:bg-muted transition-transform hover:rotate-180 duration-500 shadow-md" onClick={() => { setDirection(direction === 'AtoB' ? 'BtoA' : 'AtoB'); setAmount(''); }}>⇅</Button>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-transparent">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold"><span>Buying (Estimated)</span></div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-semibold opacity-90">{estimatedReceive}</div>
                  <div className="bg-background border border-border px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                    <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${direction === 'AtoB' ? 'bg-blue-600' : 'bg-yellow-500'}`} />
                    <span className="font-bold text-sm">{targetSymbol}</span>
                  </div>
                </div>
              </div>

              {amount > 0 && (
                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300 text-[11px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">Protocol Fee (0.3%)</span><span className="font-mono">{feeAmount} {tokenSymbol}</span></div>
                  <div className="pt-2 border-t border-border/20 flex justify-between font-bold"><span>Minimum Received</span><span className="text-foreground">{estimatedReceive} {targetSymbol}</span></div>
                </div>
              )}

              <Button className="w-full py-7 text-lg font-bold rounded-2xl shadow-lg active:scale-[0.98]" disabled={isPending || isConfirming || !amount} onClick={handleSwap}>
                {isPending ? "Waiting for Wallet..." : isConfirming ? "Mining..." : (direction === 'AtoB' ? allowanceA : allowanceB) < parseUnits(amount || '0', 18) ? `Approve ${tokenSymbol}` : `Swap ${tokenSymbol}`}
              </Button>
            </TabsContent>

            {/* --- TAB 2: POOL --- */}
            <TabsContent value="liquidity" className={`space-y-4 ${TAB_MIN_HEIGHT} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className="p-4 rounded-2xl bg-muted/30 border border-transparent">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold"><span>Deposit DAI</span><span>Bal: {formatBalance(balanceA)}</span></div>
                <Input type="number" placeholder="0.0" value={liqAmountA} onChange={(e) => setLiqAmountA(e.target.value)} className="bg-transparent border-none text-2xl font-semibold focus-visible:ring-0 p-0 h-auto" />
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-transparent">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold"><span>Deposit USDC</span><span>Bal: {formatBalance(balanceB)}</span></div>
                <Input type="number" placeholder="0.0" value={liqAmountB} onChange={(e) => setLiqAmountB(e.target.value)} className="bg-transparent border-none text-2xl font-semibold focus-visible:ring-0 p-0 h-auto" />
              </div>
              <Button className="w-full py-7 text-lg font-bold rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/10" disabled={isPending || isConfirming || !liqAmountA || !liqAmountB} onClick={handleAddLiquidity}>
                {isPending ? "Confirming..." : isConfirming ? "Processing..." : allowanceA < parseUnits(liqAmountA || '0', 18) ? "Approve DAI" : allowanceB < parseUnits(liqAmountB || '0', 18) ? "Approve USDC" : "Add Liquidity"}
              </Button>
              {isConfirmed && <Alert className="bg-emerald-500/10 border-emerald-500/50 text-emerald-500 py-2 rounded-xl"><AlertDescription className="text-center font-medium">Pool Updated! ✅</AlertDescription></Alert>}
            </TabsContent>

            {/* --- TAB 3: FAUCET --- */}
            <TabsContent value="faucet" className={`space-y-6 py-4 ${TAB_MIN_HEIGHT} flex flex-col`}>
              <div className="p-4 bg-muted/20 border border-border/50 rounded-xl text-center"><p className="text-xs text-muted-foreground uppercase font-bold">Testnet Faucet</p></div>
              <div className="grid grid-cols-2 gap-3 flex-1">
                <Button variant="outline" className="h-24 flex flex-col gap-1 border-dashed rounded-xl" onClick={() => writeContract({ address: TOKEN_A_ADDRESS, abi: TOKEN_ABI, functionName: 'mint', args: [address, parseUnits("1000", 18)] })}>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Mint</span><span className="font-bold">1,000 DAI</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-1 border-dashed rounded-xl" onClick={() => writeContract({ address: TOKEN_B_ADDRESS, abi: TOKEN_ABI, functionName: 'mint', args: [address, parseUnits("1000", 18)] })}>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Mint</span><span className="font-bold">1,000 USDC</span>
                </Button>
              </div>
            </TabsContent>

            {/* --- TAB 4: HISTORY --- */}
            <TabsContent value="history" className={`py-2 ${TAB_MIN_HEIGHT}`}>
              <div className="space-y-3 overflow-y-auto max-h-[440px] custom-scrollbar">
                {history.length === 0 ? <div className="text-center opacity-40 py-20 text-xs italic">No activity recorded</div> : 
                  history.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                      <div className="flex flex-col gap-1"><span className="text-sm font-bold">{tx.type}</span><span className="text-[10px] text-muted-foreground">{tx.time}</span></div>
                      <a href={`https://sepolia.etherscan.io/tx/${tx.id}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary">VIEW ↗</a>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}