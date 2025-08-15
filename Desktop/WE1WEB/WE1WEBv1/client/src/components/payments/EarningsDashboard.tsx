import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Euro, 
  CreditCard, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building,
  Coins,
  Info,
  ExternalLink,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface Earnings {
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  tasks_completed: number;
  canRequestPayout: boolean;
  minimumPayout: number;
}

interface PayoutHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  processed_at: string;
}

export default function EarningsDashboard() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSetup, setPaymentSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<'fiat' | 'crypto'>('fiat');

  useEffect(() => {
    if (user) {
      fetchEarnings();
      fetchPayoutHistory();
    }
  }, [user]);

  const fetchEarnings = async () => {
    try {
      const response = await fetch(`/api/payments/earnings/${user?.id}`);
      const data = await response.json();
      setEarnings(data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const fetchPayoutHistory = async () => {
    try {
      const response = await fetch(`/api/payments/payout/history/${user?.id}`);
      const data = await response.json();
      setPayoutHistory(data);
    } catch (error) {
      console.error('Error fetching payout history:', error);
    }
  };

  const setupPaymentAccount = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/payment/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          country: 'DE' // Default to Germany
        })
      });
      
      const data = await response.json();
      if (data.success && data.onboardingUrl) {
        window.open(data.onboardingUrl, '_blank');
        setPaymentSetup(true);
      }
    } catch (error) {
      console.error('Error setting up payment account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPayout = async () => {
    if (!earnings?.canRequestPayout) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/payout/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh earnings and history
        await fetchEarnings();
        await fetchPayoutHistory();
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <Card className="bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl">Your Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="w-4 h-4" />
                Available Balance
              </div>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(earnings?.pending_balance || 0)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                Total Earned
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(earnings?.total_earned || 0)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpRight className="w-4 h-4" />
                Total Withdrawn
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(earnings?.total_withdrawn || 0)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4" />
                Tasks Completed
              </div>
              <div className="text-2xl font-bold">
                {earnings?.tasks_completed || 0}
              </div>
            </div>
          </div>

          {/* Payout Progress */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Progress to minimum payout</span>
              <span className="font-medium">
                {formatCurrency(earnings?.pending_balance || 0)} / {formatCurrency(earnings?.minimumPayout || 10)}
              </span>
            </div>
            <Progress 
              value={((earnings?.pending_balance || 0) / (earnings?.minimumPayout || 10)) * 100} 
              className="h-2"
            />
            {earnings && !earnings.canRequestPayout && (
              <p className="text-xs text-muted-foreground">
                Earn {formatCurrency((earnings.minimumPayout || 10) - earnings.pending_balance)} more to request a payout
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'fiat' ? 'default' : 'outline'}
              onClick={() => setActiveTab('fiat')}
              className="flex-1"
            >
              <Euro className="w-4 h-4 mr-2" />
              Bank Transfer (Active)
            </Button>
            <Button
              variant={activeTab === 'crypto' ? 'default' : 'outline'}
              onClick={() => setActiveTab('crypto')}
              className="flex-1"
              disabled
            >
              <Coins className="w-4 h-4 mr-2" />
              Crypto (Coming Soon)
            </Button>
          </div>

          {activeTab === 'fiat' && (
            <div className="space-y-4">
              {!paymentSetup ? (
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription>
                    Set up your payment account to receive payouts directly to your bank account.
                    We use Stripe for secure, fast payments across Europe.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-500/20 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    Your payment account is set up and ready to receive payouts!
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                {!paymentSetup ? (
                  <Button
                    onClick={setupPaymentAccount}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Set Up Bank Account
                  </Button>
                ) : (
                  <Button
                    onClick={requestPayout}
                    disabled={!earnings?.canRequestPayout || isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Request Payout
                  </Button>
                )}
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Instant transfers to EU bank accounts</p>
                <p>• No fees for payouts over €50</p>
                <p>• Secure processing via Stripe</p>
                <p>• Available in all EU countries</p>
              </div>
            </div>
          )}

          {activeTab === 'crypto' && (
            <div className="space-y-4">
              <Alert className="border-yellow-500/20 bg-yellow-500/10">
                <Clock className="h-4 w-4 text-yellow-500" />
                <AlertDescription>
                  <strong>Coming Q2 2025:</strong> Receive payments in USDC and USDT on Polygon network
                  for instant, low-fee transfers worldwide.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">USDC</span>
                      <Badge variant="outline" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      USD Coin - Stable value pegged to US Dollar
                    </p>
                    <div className="mt-2 text-xs text-green-500">
                      • No volatility • Instant transfers • Low fees
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">USDT</span>
                      <Badge variant="outline" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tether - Most liquid stablecoin
                    </p>
                    <div className="mt-2 text-xs text-green-500">
                      • Global acceptance • 24/7 availability • DeFi ready
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Why Stablecoins?</strong> Get the benefits of crypto (instant, global, low-fee) 
                  without the volatility. Perfect for consistent earnings from compute tasks.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payoutHistory.length > 0 ? (
            <div className="space-y-3">
              {payoutHistory.map((payout) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      payout.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                    }`}>
                      {payout.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {formatCurrency(payout.amount, payout.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payout.processed_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                    {payout.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No payouts yet</p>
              <p className="text-sm mt-1">Complete tasks to earn your first payout!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong> Complete AI training tasks to earn money. Once you reach €{earnings?.minimumPayout || 10}, 
          you can request a payout to your bank account. Payments are processed within 1-3 business days.
          Crypto payments coming soon for instant, global transfers!
        </AlertDescription>
      </Alert>
    </div>
  );
}