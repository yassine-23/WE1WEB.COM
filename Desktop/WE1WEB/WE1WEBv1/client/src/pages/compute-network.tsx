import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Network, 
  Cpu, 
  Users, 
  Activity,
  Info,
  Zap,
  Globe,
  Shield,
  TrendingUp
} from 'lucide-react';
import FunctionalPoolManager from '@/components/pools/FunctionalPoolManager';
import DeviceSyncDashboard from '@/components/sync/DeviceSyncDashboard';
import NetworkProjections from '@/components/projections/NetworkProjections';
import { motion } from 'framer-motion';

export default function ComputeNetwork() {
  const [activeTab, setActiveTab] = useState('sync');

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-background to-background/80 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <Badge className="px-4 py-1.5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-white/10">
              <Activity className="w-3 h-3 mr-2" />
              Live Network Control
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Compute Network Hub
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect your devices, join processing pools, and generate valuable AI training data. 
              Every task you complete helps train the next generation of AI models while earning you rewards.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        {/* Network Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border-white/10">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                    <span className="text-sm text-green-400">Network Active</span>
                  </div>
                  <div className="text-2xl font-bold">Pre-Launch</div>
                  <div className="text-xs text-muted-foreground">Beta Q1 2025</div>
                </div>
                
                <div className="text-center">
                  <Globe className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                  <div className="text-2xl font-bold">385M</div>
                  <div className="text-xs text-muted-foreground">EU Devices Ready</div>
                </div>
                
                <div className="text-center">
                  <Zap className="w-5 h-5 mx-auto mb-2 text-yellow-400" />
                  <div className="text-2xl font-bold">2-5</div>
                  <div className="text-xs text-muted-foreground">TFLOPS per Device</div>
                </div>
                
                <div className="text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-2 text-purple-400" />
                  <div className="text-2xl font-bold">€50-100</div>
                  <div className="text-xs text-muted-foreground">Monthly Earnings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Important Notice */}
        <Alert className="mb-8 border-blue-500/20 bg-blue-500/5">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How This Creates Real Value:</strong> Tech giants like OpenAI, Anthropic, and Google need massive amounts of 
            high-quality training data. By contributing your device's idle time to generate synthetic conversations, verify facts, 
            and provide human feedback, you're creating data worth $50-500 per 1000 tasks. This is why you get paid - you're 
            providing a valuable service that improves AI for everyone.
          </AlertDescription>
        </Alert>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
            <TabsTrigger value="sync" className="data-[state=active]:bg-primary/20">
              <Network className="w-4 h-4 mr-2" />
              Device Sync
            </TabsTrigger>
            <TabsTrigger value="pools" className="data-[state=active]:bg-primary/20">
              <Users className="w-4 h-4 mr-2" />
              Processing Pools
            </TabsTrigger>
            <TabsTrigger value="projections" className="data-[state=active]:bg-primary/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Network Growth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sync" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <DeviceSyncDashboard />
            </motion.div>
          </TabsContent>

          <TabsContent value="pools" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FunctionalPoolManager />
            </motion.div>
          </TabsContent>

          <TabsContent value="projections" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <NetworkProjections />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-xl">Why Your Contribution Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Shield className="w-8 h-8 text-green-500" />
                  <h4 className="font-semibold">Improve AI Safety</h4>
                  <p className="text-sm text-muted-foreground">
                    Your feedback helps identify harmful outputs and edge cases, making AI safer for everyone.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Cpu className="w-8 h-8 text-blue-500" />
                  <h4 className="font-semibold">Democratize Computing</h4>
                  <p className="text-sm text-muted-foreground">
                    Break the monopoly of big tech by creating a distributed alternative to centralized data centers.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Globe className="w-8 h-8 text-purple-500" />
                  <h4 className="font-semibold">Zero Carbon Impact</h4>
                  <p className="text-sm text-muted-foreground">
                    Use existing devices instead of building new data centers, reducing AI's environmental footprint by 90%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}