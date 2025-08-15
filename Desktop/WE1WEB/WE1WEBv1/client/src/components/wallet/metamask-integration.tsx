import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wallet, 
  ExternalLink, 
  Copy, 
  Check, 
  DollarSign, 
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: {
    eth: number;
    comp: number;
    usd: number;
  };
  network: string;
}

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'deposit' | 'exchange';
  amount: number;
  currency: 'ETH' | 'COMP' | 'USD';
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'earning',
    amount: 25.50,
    currency: 'COMP',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'completed',
    description: 'Device rental earnings'
  },
  {
    id: '2',
    type: 'withdrawal',
    amount: 0.015,
    currency: 'ETH',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'completed',
    description: 'Withdrawal to MetaMask'
  },
  {
    id: '3',
    type: 'exchange',
    amount: 100.00,
    currency: 'COMP',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: 'completed',
    description: 'USD to COMP exchange'
  }
];

export default function MetaMaskIntegration() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: { eth: 0, comp: 0, usd: 0 },
    network: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'COMP' | 'ETH' | 'USD'>('COMP');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const connectMetaMask = async () => {
    setIsConnecting(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        const chainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
        
        const networkName = chainId === '0x1' ? 'Ethereum Mainnet' : 'Unknown Network';
        
        setWalletState({
          isConnected: true,
          address: accounts[0],
          balance: { eth: 2.45, comp: 1247.50, usd: 3420.75 }, // Mock balance
          network: networkName
        });
        
        toast({
          title: "MetaMask Connected",
          description: "Your wallet has been successfully connected to WE1WEB"
        });
      } else {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to connect your wallet",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: { eth: 0, comp: 0, usd: 0 },
      network: ''
    });
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected from WE1WEB"
    });
  };

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard"
      });
    }
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Withdrawal Initiated",
      description: `Withdrawing ${withdrawAmount} ${selectedCurrency} to your MetaMask wallet`
    });
    setWithdrawAmount('');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'earning':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-blue-500" />;
      case 'exchange':
        return <Coins className="w-4 h-4 text-purple-500" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Card */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-6 h-6" />
            <span>Wallet Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!walletState.isConnected ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Connect MetaMask Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your MetaMask wallet to manage your earnings and make withdrawals
                </p>
              </div>
              <Button 
                onClick={connectMetaMask} 
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
              >
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </Button>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure connection via Web3</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Wallet Connected</p>
                    <p className="text-sm text-muted-foreground">{walletState.network}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono">{formatAddress(walletState.address!)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={copyAddress}
                      className="h-6 w-6 p-0"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {walletState.isConnected && (
        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="modern-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">COMP Tokens</p>
                      <p className="text-2xl font-bold">{walletState.balance.comp.toLocaleString()}</p>
                    </div>
                    <Coins className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="modern-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ethereum</p>
                      <p className="text-2xl font-bold">{walletState.balance.eth}</p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">ETH</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="modern-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">USD Value</p>
                      <p className="text-2xl font-bold">${walletState.balance.usd.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Withdraw Earnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as 'COMP' | 'ETH' | 'USD')}
                  >
                    <option value="COMP">COMP Tokens</option>
                    <option value="ETH">Ethereum</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: {walletState.balance[selectedCurrency.toLowerCase() as keyof typeof walletState.balance]} {selectedCurrency}
                  </p>
                </div>
                
                <Button onClick={handleWithdraw} className="w-full">
                  Withdraw to MetaMask
                </Button>
                
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-700 dark:text-yellow-300">Transaction Fees</p>
                    <p className="text-yellow-600 dark:text-yellow-400">
                      Network fees will apply for withdrawals. Estimated gas fee: ~$2-5 USD
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium capitalize">{transaction.type}</p>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.type === 'withdrawal' ? '-' : '+'}
                          {transaction.amount} {transaction.currency}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {transaction.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}