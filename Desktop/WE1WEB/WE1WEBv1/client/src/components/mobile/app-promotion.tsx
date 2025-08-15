import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  Star, 
  Users, 
  Zap, 
  DollarSign,
  Shield,
  Wifi,
  Battery,
  TrendingUp
} from 'lucide-react';

const appFeatures = [
  {
    icon: DollarSign,
    title: "Passive Income",
    description: "Earn money 24/7 while your phone charges"
  },
  {
    icon: Users,
    title: "Pool Collaboration",
    description: "Join computing pools for higher earnings"
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "Enterprise-grade security for your device"
  },
  {
    icon: Zap,
    title: "Smart Optimization",
    description: "AI optimizes performance without draining battery"
  }
];

const earnings = [
  { device: "iPhone 15 Pro", daily: "$3-8", monthly: "$90-240" },
  { device: "Samsung Galaxy S24", daily: "$2-6", monthly: "$60-180" },
  { device: "Google Pixel 8", daily: "$2-5", monthly: "$60-150" },
  { device: "OnePlus 12", daily: "$2-6", monthly: "$60-180" }
];

export default function MobileAppPromotion() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="modern-card bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 border-primary/20">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  📱 Mobile App Available
                </Badge>
                <h2 className="text-3xl font-bold">
                  Turn Your Phone Into a 
                  <span className="block text-primary">Mini Earning Machine</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Download the WE1WEB mobile app and start earning passive income by contributing 
                  your device's idle computing power to our global network.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">1.2M+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">$2.5M+</div>
                  <div className="text-sm text-muted-foreground">Earned by Users</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 h-14 bg-black hover:bg-gray-800 text-white"
                  onClick={() => window.open('/api/downloads/ios', '_blank')}
                  disabled
                >
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-xs">Coming Soon</div>
                      <div className="text-sm font-bold">App Store</div>
                    </div>
                  </div>
                </Button>
                <Button 
                  className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.open('/api/downloads/android', '_blank')}
                  disabled
                >
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-xs">Coming Soon</div>
                      <div className="text-sm font-bold">Google Play</div>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8/5.0 Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>500K+ Downloads</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="mx-auto w-64 h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="text-white text-sm font-medium">WE1WEB</div>
                    <Battery className="w-4 h-4 text-green-400" />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-white text-sm font-medium">Today's Earnings</div>
                      <div className="text-white text-2xl font-bold">$5.73</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-white text-sm font-medium">Pool Members</div>
                      <div className="text-white text-xl font-bold">847 devices</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-white text-sm font-medium">Status</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm">Earning</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                +$0.25
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                🔥 Active
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {appFeatures.map((feature, index) => (
          <Card key={index} className="modern-card text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earning Potential */}
      <Card className="modern-card">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Earning Potential by Device</h3>
            <p className="text-muted-foreground">
              See how much you can earn with different mobile devices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {earnings.map((item, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4 text-center">
                <Smartphone className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h4 className="font-medium mb-2">{item.device}</h4>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Daily</div>
                  <div className="text-lg font-bold text-green-600">{item.daily}</div>
                  <div className="text-sm text-muted-foreground">Monthly</div>
                  <div className="text-xl font-bold text-primary">{item.monthly}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              * Earnings vary based on device specifications, network demand, and participation level
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Pool Bonus Multiplier</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Join larger pools to earn up to 2.5x more! Collaborate with thousands of devices worldwide.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="modern-card">
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold text-center mb-6">How Mobile Earning Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold">1. Download & Setup</h4>
              <p className="text-sm text-muted-foreground">
                Install the app, create your account, and configure your device preferences
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold">2. Join a Pool</h4>
              <p className="text-sm text-muted-foreground">
                Connect with other users to form powerful computing pools for bigger tasks
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold">3. Start Earning</h4>
              <p className="text-sm text-muted-foreground">
                Earn automatically when your device contributes to AI training and processing
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg inline-block">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <Wifi className="w-5 h-5" />
                <span className="font-medium">Smart Power Management</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Our AI automatically manages your device's contribution based on battery level, 
                charging status, and usage patterns to ensure optimal performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}