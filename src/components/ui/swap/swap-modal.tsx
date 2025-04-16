import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDown } from "lucide-react";
import { Dispatch, SetStateAction, useState, useCallback, useMemo } from "react";
import { ApiV3PoolInfoItem } from "@raydium-io/raydium-sdk-v2";
import { useWallet } from "@solana/wallet-adapter-react";
/* import { toast } from "react-toastify"; */

interface SwapTokenModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  poolInfoBaseItem?: ApiV3PoolInfoItem;
}
declare type SwapSide = "in" | "out"

export const SwapTokenModal = ({ 
  open, 
  setOpen, 
  poolInfoBaseItem
}: SwapTokenModalProps) => {

  const { publicKey } = useWallet()

  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Extract token info from pool
  
  const fixedSide: SwapSide = useMemo(() => 'in', [])
  const fromToken = useMemo(() => poolInfoBaseItem?.mintA.symbol || "SOL", [poolInfoBaseItem?.mintA.symbol]);
  /* const fromTokenMint = useMemo(() => poolInfoBaseItem?.mintA.address || "", [poolInfoBaseItem?.mintA.address]); */
  const toToken = useMemo(() => poolInfoBaseItem?.mintB.symbol || "USDC", [poolInfoBaseItem?.mintB.symbol]);
  /* const toTokenMint = useMemo(() => poolInfoBaseItem?.mintB.address || "", [poolInfoBaseItem?.mintB.address]); */
  const rate = useMemo(() => poolInfoBaseItem?.price ? poolInfoBaseItem.price.toFixed(4) : "0.0",
    [poolInfoBaseItem?.price]);
  const feeRate = useMemo(() => poolInfoBaseItem?.feeRate ? (poolInfoBaseItem.feeRate * 100).toFixed(2) : "0.0", [poolInfoBaseItem?.feeRate]);

  const handleSwap = useCallback(async () => {
    if (!publicKey || !poolInfoBaseItem || !fromAmount) return;

    setLoading(true);
    setLoading(false);
  }, [publicKey, poolInfoBaseItem, fromAmount]);

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = !e.target.value ? '0' : e.target.value;
    setFromAmount(value);
    if (poolInfoBaseItem?.price && value) {
      setToAmount((Number(value) * poolInfoBaseItem.price).toFixed(4));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {fixedSide === 'in' ? `${fromToken} / ${toToken}` : `${toToken} / ${fromToken}`}
            <div className="text-muted-foreground text-sm font-normal">
              {rate} <span className={rate.startsWith('-') ? 'text-destructive' : 'text-green-600'}>{feeRate}% fee</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* From Token */}
          <div className="bg-muted rounded-lg p-4">
            <Label htmlFor="fromAmount" className="text-muted-foreground text-sm">From</Label>
            <div className="flex items-center justify-between">
              <Input
                id="fromAmount"
                value={fromAmount}
                onChange={handleFromAmountChange}
                placeholder="0.0"
                className="border-0 bg-transparent p-0 text-xl focus-visible:ring-0"
              />
              <div className="bg-secondary flex items-center gap-2 rounded-full px-3 py-1">
                <span>{fromToken}</span>
              </div>
            </div>
            <div className="text-muted-foreground mt-1 text-right text-sm">≈ $0</div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="bg-muted rounded-lg p-4">
            <Label htmlFor="toAmount" className="text-muted-foreground text-sm">To</Label>
            <div className="flex items-center justify-between">
              <Input
                id="toAmount"
                value={toAmount}
                readOnly
                placeholder="0.0"
                className="border-0 bg-transparent p-0 text-xl focus-visible:ring-0"
              />
              <div className="bg-secondary flex items-center gap-2 rounded-full px-3 py-1">
                <span>{toToken}</span>
              </div>
            </div>
            <div className="text-muted-foreground mt-1 text-right text-sm">≈ $0</div>
          </div>

          {/* Price Info */}
          <div className="bg-muted rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span>1 {fromToken} = {rate} {toToken}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span>{feeRate}%</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSwap}
            disabled={!fromAmount || loading}
          >
            {loading ? "Processing..." : "Swap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};