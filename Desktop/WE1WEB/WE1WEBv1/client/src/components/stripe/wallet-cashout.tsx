import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Wallet, DollarSign } from "lucide-react";

interface WalletCashoutProps {
  balance: number;
  onSuccess?: () => void;
}

export function WalletCashout({ balance, onSuccess }: WalletCashoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const cashoutMutation = useMutation({
    mutationFn: async (cashoutAmount: number) => {
      const response = await apiRequest('POST', '/api/wallet/cashout', {
        amount: cashoutAmount
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cashout Successful",
        description: `$${amount} has been transferred to your account.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens/balance"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Cashout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const cashoutAmount = parseFloat(amount);
    if (cashoutAmount <= 0 || cashoutAmount > balance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount within your balance.",
        variant: "destructive",
      });
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      await cashoutMutation.mutateAsync(cashoutAmount);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsProcessing(false);
    }
  };

  const maxAmount = Math.floor(balance * 100) / 100; // Round down to 2 decimal places

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Cash Out Earnings
        </CardTitle>
        <CardDescription>
          Available balance: ${balance.toFixed(2)} COMP
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to withdraw</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Maximum: ${maxAmount.toFixed(2)}
            </p>
          </div>

          <PaymentElement 
            options={{
              layout: "tabs"
            }}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || isProcessing || !amount || parseFloat(amount) <= 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Withdraw $${amount || '0.00'}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}