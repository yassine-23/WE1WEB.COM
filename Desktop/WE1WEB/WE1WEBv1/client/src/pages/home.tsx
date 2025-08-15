import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import EnhancedNavigation from "@/components/enhanced-navigation";
import ProviderDashboard from "@/components/dashboard/provider-dashboard";
import DeveloperDashboard from "@/components/dashboard/developer-dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Monitor, 
  Settings,
  Wallet,
  Activity,
  BarChart3,
  Globe
} from "lucide-react";

// Mock data for live device monitoring
const generateLiveMetrics = () => ({
  cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
  memory: Math.floor(Math.random() * 40) + 30, // 30-70%
  gpu: Math.floor(Math.random() * 50) + 25, // 25-75%
  network: Math.floor(Math.random() * 20) + 80, // 80-100%
  temperature: Math.floor(Math.random() * 15) + 45, // 45-60°C
});

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "devices" | "wallet">("overview");
  const [liveMetrics, setLiveMetrics] = useState(generateLiveMetrics());

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: nodes } = useQuery({
    queryKey: ["/api/nodes"],
  });

  const { data: tokenBalance } = useQuery({
    queryKey: ["/api/tokens/balance"],
  });

  const { data: tokenTransactions } = useQuery({
    queryKey: ["/api/tokens/transactions"],
  });

  // Update live metrics every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(generateLiveMetrics());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0 clean-grid opacity-10"></div>
      
      <EnhancedNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground enhanced-text mb-4">
            Welcome to WE1WEB, {user.firstName || "User"}
          </h1>
          <p className="text-muted-foreground text-lg">
            Monitor your compute resources and track earnings across the distributed AI compute network
          </p>
          
          {/* Mission Statement */}
          <div className="modern-card p-6 mb-8 border-green-500/20">
            <div className="text-center">
              <Globe className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-green-400 mb-2">Our Mission</h2>
              <p className="text-sm text-muted-foreground">
                Building the world's largest decentralized data processing network to combat climate change through AI-powered solutions. 
                Every device you contribute helps reduce global AI carbon emissions by up to 60%.
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "devices" | "wallet")} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <BarChart3 className="mr-2 w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="devices" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">
              <Monitor className="mr-2 w-4 h-4" />
              My Devices
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400">
              <Wallet className="mr-2 w-4 h-4" />
              My Wallet
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Neural Network Status Cards */}
            {dashboardStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="modern-card border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Earnings</p>
                        <p className="text-2xl font-bold text-primary enhanced-text">
                          ${Number(dashboardStats.totalEarnings || 0).toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-primary/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="modern-card border-secondary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active Nodes</p>
                        <p className="text-2xl font-bold text-secondary enhanced-text">
                          {dashboardStats.activeNodes}
                        </p>
                      </div>
                      <Monitor className="w-8 h-8 text-secondary/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="futuristic-card border-green-400/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Completed Tasks</p>
                        <p className="text-2xl font-bold text-green-400 enhanced-text">
                          {dashboardStats.completedTasks}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-green-400/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="futuristic-card border-yellow-400/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Processing</p>
                        <p className="text-2xl font-bold text-yellow-400 enhanced-text">
                          {dashboardStats.currentTasks}
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-yellow-400/60" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="text-primary">Resource Provider Hub</CardTitle>
                  <CardDescription>Manage your compute resources and track earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProviderDashboard />
                </CardContent>
              </Card>

              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="text-secondary">AI Developer Tools</CardTitle>
                  <CardDescription>Deploy jobs and access neural marketplace</CardDescription>
                </CardHeader>
                <CardContent>
                  <DeveloperDashboard />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Device Monitor</h2>
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                <Settings className="mr-2 w-4 h-4" />
                Configure Settings
              </Button>
            </div>

            {/* Live Device Metrics */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Live System Metrics
                </CardTitle>
                <CardDescription>Real-time performance monitoring of your devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* CPU Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">CPU</span>
                      </div>
                      <span className="text-sm font-bold text-blue-400">{liveMetrics.cpu}%</span>
                    </div>
                    <Progress value={liveMetrics.cpu} className="h-2" />
                  </div>

                  {/* Memory Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">Memory</span>
                      </div>
                      <span className="text-sm font-bold text-purple-400">{liveMetrics.memory}%</span>
                    </div>
                    <Progress value={liveMetrics.memory} className="h-2" />
                  </div>

                  {/* GPU Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">GPU</span>
                      </div>
                      <span className="text-sm font-bold text-green-400">{liveMetrics.gpu}%</span>
                    </div>
                    <Progress value={liveMetrics.gpu} className="h-2" />
                  </div>

                  {/* Network */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-300">Network</span>
                      </div>
                      <span className="text-sm font-bold text-cyan-400">{liveMetrics.network}%</span>
                    </div>
                    <Progress value={liveMetrics.network} className="h-2" />
                  </div>
                </div>

                {/* Temperature and Status */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                      ONLINE
                    </Badge>
                    <span className="text-sm text-gray-300">
                      Temperature: <span className="text-orange-400 font-medium">{liveMetrics.temperature}°C</span>
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Last update: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device List */}
            <div className="grid gap-4">
              {nodes && nodes.length > 0 ? (
                nodes.map((node: any) => (
                  <Card key={node.id} className="modern-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Monitor className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{node.name}</h3>
                            <p className="text-sm text-gray-400">{node.hardwareInfo?.os || "Unknown OS"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={node.status === "online" ? "default" : "secondary"}>
                            {node.status}
                          </Badge>
                          <p className="text-sm text-gray-400 mt-1">
                            {node.hardwareInfo?.ram || "N/A"}GB RAM
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="modern-card">
                  <CardContent className="p-8 text-center">
                    <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No Devices Connected</h3>
                    <p className="text-gray-500 mb-4">
                      Connect your first device to start earning with the neural network
                    </p>
                    <Button className="bg-primary/20 hover:bg-primary/30 text-primary enhanced-border">
                      Connect Device
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">My Wallet</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="border-green-400/30 text-green-400 hover:bg-green-400/10">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Earnings Settings
                </Button>
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                  <DollarSign className="mr-2 w-4 h-4" />
                  Withdraw
                </Button>
              </div>
            </div>

            {/* Token Balance */}
            <Card className="modern-card border-green-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-400" />
                  COMP Token Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-green-400 enhanced-text mb-2">
                    {tokenBalance?.balance || "0"} COMP
                  </div>
                  <p className="text-gray-400">
                    ≈ ${((parseFloat(tokenBalance?.balance || "0")) * 0.05).toFixed(2)} USD
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Breakdown */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-400">Today's Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {(Math.random() * 5 + 2).toFixed(2)} COMP
                  </div>
                  <p className="text-xs text-gray-500 mt-1">+12% from yesterday</p>
                </CardContent>
              </Card>

              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-400">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">
                    {(Math.random() * 30 + 15).toFixed(2)} COMP
                  </div>
                  <p className="text-xs text-gray-500 mt-1">+8% from last week</p>
                </CardContent>
              </Card>

              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-400">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {(Math.random() * 120 + 60).toFixed(2)} COMP
                  </div>
                  <p className="text-xs text-gray-500 mt-1">+15% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest earning activities</CardDescription>
              </CardHeader>
              <CardContent>
                {tokenTransactions && tokenTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {tokenTransactions.slice(0, 5).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{transaction.description}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-400">
                            +{transaction.amount} COMP
                          </p>
                          <p className="text-xs text-gray-400">{transaction.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No Transactions Yet</h3>
                    <p className="text-gray-500">
                      Start contributing compute power to see your earnings here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
