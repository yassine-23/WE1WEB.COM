import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  ExternalLink, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Download 
} from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletSetup() {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    // Check if MetaMask is installed
    setHasMetaMask(typeof window.ethereum !== 'undefined');
    
    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setIsConnected(true);
            setAccount(accounts[0]);
          }
        });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setIsConnected(true);
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const installMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!hasMetaMask) {
    return (
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-6 h-6" />
            <span>Wallet Setup Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              MetaMask wallet is required to manage your earnings and receive payments.
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold">Install MetaMask Wallet</h3>
              <p className="text-sm text-muted-foreground">
                MetaMask is a secure crypto wallet that lets you manage your earnings
              </p>
            </div>
            <Button onClick={installMetaMask} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Install MetaMask
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-6 h-6" />
            <span>Connect Your Wallet</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Connect MetaMask</h3>
              <p className="text-sm text-muted-foreground">
                Connect your MetaMask wallet to start earning and manage your funds
              </p>
            </div>
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure connection via Web3</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span>Wallet Connected</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">MetaMask Wallet</div>
            <div className="text-sm text-muted-foreground font-mono">
              {formatAddress(account!)}
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Connected
          </Badge>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Ready to receive</div>
          <div className="text-lg font-bold">COMP Tokens & ETH</div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Etherscan
        </Button>
      </CardContent>
    </Card>
  );
}