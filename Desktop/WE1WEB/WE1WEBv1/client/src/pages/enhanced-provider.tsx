import DeviceVisualGrid from '@/components/devices/device-visual-grid';
import MetaMaskIntegration from '@/components/wallet/metamask-integration';
import CollaborativePools from '@/components/pools/collaborative-pools';
import MobileAppPromotion from '@/components/mobile/app-promotion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Monitor, 
  Laptop, 
  Server, 
  DollarSign, 
  Users, 
  Zap,
  TrendingUp,
  Download
} from 'lucide-react';

export default function EnhancedProvider() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Provider Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Transform your devices into earning machines. Monitor performance, join collaborative pools, 
          and maximize your passive income potential.
        </p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="modern-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Today's Earnings</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">$47.83</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Active Devices</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">7</p>
              </div>
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Pool Members</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">3,247</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Compute Power</p>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">892 TH/s</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="devices" className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>My Devices</span>
          </TabsTrigger>
          <TabsTrigger value="pools" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Pools</span>
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Wallet</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span>Mobile App</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          <DeviceVisualGrid />
        </TabsContent>

        <TabsContent value="pools" className="space-y-6">
          <CollaborativePools />
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <MetaMaskIntegration />
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <MobileAppPromotion />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Analytics */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Earnings Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Daily Average</span>
                    <span className="font-bold text-green-600">$42.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Weekly Total</span>
                    <span className="font-bold text-green-600">$297.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Projected</span>
                    <span className="font-bold text-green-600">$1,275.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pool Bonus</span>
                    <span className="font-bold text-purple-600">+47%</span>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Efficiency Score</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-sm font-bold">94%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Performance */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Device Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4" />
                      <span>Gaming Desktop</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Laptop className="w-4 h-4" />
                      <span>MacBook Pro</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4" />
                      <span>iPhone 15 Pro</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4" />
                      <span>Home Server</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Optimization Tip
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Your iPhone could earn 35% more by joining a mobile-specific pool. 
                    <Button variant="link" className="h-auto p-0 text-blue-600 dark:text-blue-400">
                      Learn more
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Mobile App CTA */}
      <Card className="modern-card bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Download WE1WEB Mobile App</h3>
                <p className="text-muted-foreground">Turn your phone into a passive income generator</p>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Get App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}