import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { WalletCashout } from "@/components/stripe/wallet-cashout";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowLeft, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

export default function WalletCashoutPage() {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { data: tokenBalance } = useQuery({
    queryKey: ["/api/tokens/balance"],
  });

  const { data: tokenTransactions } = useQuery({
    queryKey: ["/api/tokens/transactions"],
  });

  // For cashout, we'll simulate a setup intent for bank account verification
  useEffect(() => {
    // In a real implementation, you'd create a SetupIntent for bank account verification
    // For now, we'll set a placeholder
    setClientSecret("si_placeholder_for_demo");
  }, []);

  if (!user) {
    return null;
  }

  const balance = tokenBalance?.balance || 0;
  const recentEarnings = tokenTransactions?.filter((t: any) => t.type === 'earnings').slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Wallet Cashout</h1>
              <p className="text-muted-foreground">Withdraw your COMP token earnings</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Balance & Cashout Form */}
          <div className="space-y-6">
            {/* Current Balance */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">
                  ${balance.toFixed(2)} COMP
                </div>
                <p className="text-sm text-muted-foreground">
                  Earned from {recentEarnings.length} recent transactions
                </p>
              </CardContent>
            </Card>

            {/* Cashout Form */}
            {clientSecret && balance > 0 && (
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#4ECDC4',
                    }
                  }
                }}
              >
                <WalletCashout 
                  balance={balance}
                  onSuccess={() => {
                    // Refresh balance after successful cashout
                    window.location.reload();
                  }}
                />
              </Elements>
            )}

            {balance <= 0 && (
              <Card className="modern-card">
                <CardContent className="p-6 text-center">
                  <div className="text-muted-foreground">
                    No earnings available for withdrawal. Start providing compute resources to earn COMP tokens.
                  </div>
                  <Link href="/provider">
                    <Button className="mt-4">
                      Start Earning
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Transaction History */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Recent Earnings
              </CardTitle>
              <CardDescription>
                Your latest COMP token transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEarnings.length > 0 ? (
                  recentEarnings.map((transaction: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-green-500 font-medium">
                        +${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No earnings yet. Connect your compute resources to start earning.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}