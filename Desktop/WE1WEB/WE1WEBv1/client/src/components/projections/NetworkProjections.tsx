import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Users, 
  Cpu, 
  Activity, 
  Info,
  Smartphone,
  Server,
  Globe,
  Battery,
  Zap
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function NetworkProjections() {
  const [activePhase, setActivePhase] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    devices: 0,
    computePower: 0,
    ram: 0,
    carbonSaved: 0
  });

  // Growth phases (conservative, realistic projections based on market data)
  const phases = [
    {
      name: "Beta Launch",
      timeline: "Q1 2025",
      devices: 5000,
      activeUsers: 1000,
      utilization: 20,
      region: "Berlin Tech Community",
      status: "upcoming",
      targetMarket: "0.001% of Berlin metro"
    },
    {
      name: "Germany Pilot",
      timeline: "Q2-Q3 2025",
      devices: 50000,
      activeUsers: 15000,
      utilization: 30,
      region: "Major German Cities",
      status: "planned",
      targetMarket: "0.06% of German devices"
    },
    {
      name: "DACH Region",
      timeline: "Q4 2025-Q1 2026",
      devices: 250000,
      activeUsers: 100000,
      utilization: 40,
      region: "Germany, Austria, Switzerland",
      status: "planned",
      targetMarket: "0.25% of DACH devices"
    },
    {
      name: "EU Expansion",
      timeline: "2026-2027",
      devices: 1000000,
      activeUsers: 450000,
      utilization: 45,
      region: "European Union",
      status: "projected",
      targetMarket: "0.26% of EU smartphones"
    },
    {
      name: "Global Launch",
      timeline: "2028+",
      devices: 5000000,
      activeUsers: 2500000,
      utilization: 50,
      region: "Worldwide",
      status: "vision",
      targetMarket: "0.06% of global devices"
    }
  ];

  // Calculate computational metrics
  const calculateMetrics = (devices: number, utilization: number) => {
    const avgRAMPerDevice = 8; // GB
    const avgComputePerDevice = 5; // TFLOPS
    const activeDevices = devices * (utilization / 100);
    
    return {
      totalRAM: (activeDevices * avgRAMPerDevice / 1000).toFixed(1), // in TB
      totalCompute: (activeDevices * avgComputePerDevice / 1000).toFixed(1), // in PFLOPS
      equivalent: Math.floor(activeDevices / 1000), // Data center equivalents
      carbonSaved: (activeDevices * 0.5).toFixed(0), // Tons of CO2 per year
      energySaved: (activeDevices * 200).toFixed(0) // kWh per year
    };
  };

  // Growth chart data
  const growthData = [
    { month: 'Launch', devices: 0, revenue: 0 },
    { month: 'Month 3', devices: 10000, revenue: 20 },
    { month: 'Month 6', devices: 50000, revenue: 125 },
    { month: 'Month 9', devices: 150000, revenue: 450 },
    { month: 'Month 12', devices: 500000, revenue: 1500 },
    { month: 'Month 18', devices: 1500000, revenue: 4500 },
    { month: 'Month 24', devices: 5000000, revenue: 15000 },
    { month: 'Month 36', devices: 10000000, revenue: 30000 }
  ];

  // Computational power comparison
  const powerComparison = [
    { name: 'Traditional Data Center', value: 100, cost: 12000000, carbon: 5000 },
    { name: 'WE1WEB Network (1M devices)', value: 95, cost: 150000, carbon: -500 }
  ];

  useEffect(() => {
    // Animate stats on mount
    const timer = setTimeout(() => {
      setAnimatedStats({
        devices: phases[activePhase].devices,
        computePower: phases[activePhase].devices * 5 / 1000,
        ram: phases[activePhase].devices * 8 / 1000,
        carbonSaved: phases[activePhase].devices * 0.5
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [activePhase]);

  const currentMetrics = calculateMetrics(phases[activePhase].devices, phases[activePhase].utilization);

  return (
    <div className="space-y-8">
      {/* Transparency Notice */}
      <Alert className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Transparency Notice:</strong> These are projected growth targets based on market research 
          and comparable platform adoption rates. Actual results will vary based on market conditions, 
          user adoption, and technical performance. We are currently in pre-launch phase.
        </AlertDescription>
      </Alert>

      {/* Mission-Driven Header */}
      <Card className="modern-card bg-gradient-to-br from-primary/5 via-purple-500/5 to-cyan-500/5">
        <CardContent className="p-8">
          <div className="space-y-4">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Network Growth Projections
            </Badge>
            <h2 className="text-2xl font-bold">
              Building Europe's Democratic Supercomputer
            </h2>
            <p className="text-muted-foreground">
              Transforming idle smartphones into humanity's most powerful distributed AI network. 
              Each device contributes ~5 TFLOPS of neural compute and 8GB RAM during charging hours.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Growth Phases */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle>Deployment Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="0" onValueChange={(v) => setActivePhase(parseInt(v))}>
            <TabsList className="grid grid-cols-5 w-full">
              {phases.map((phase, idx) => (
                <TabsTrigger key={idx} value={idx.toString()} className="text-xs">
                  {phase.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {phases.map((phase, idx) => (
              <TabsContent key={idx} value={idx.toString()} className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Devices</p>
                          <p className="text-2xl font-bold">
                            {phase.devices.toLocaleString()}
                          </p>
                        </div>
                        <Smartphone className="w-8 h-8 text-primary/20" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Contributors</p>
                          <p className="text-2xl font-bold">
                            {phase.activeUsers.toLocaleString()}
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-green-500/20" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Compute Power</p>
                          <p className="text-2xl font-bold">
                            {currentMetrics.totalCompute} PFLOPS
                          </p>
                        </div>
                        <Cpu className="w-8 h-8 text-purple-500/20" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Distributed RAM</p>
                          <p className="text-2xl font-bold">
                            {currentMetrics.totalRAM} TB
                          </p>
                        </div>
                        <Server className="w-8 h-8 text-blue-500/20" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Network Utilization</span>
                      <span className="font-medium">{phase.utilization}%</span>
                    </div>
                    <Progress value={phase.utilization} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Geographic Coverage</span>
                      <span className="font-medium">{phase.region}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {phase.timeline}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Phase Status</span>
                      <Badge variant={
                        phase.status === 'upcoming' ? 'default' : 
                        phase.status === 'planned' ? 'secondary' : 
                        'outline'
                      }>
                        {phase.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Environmental Impact */}
                <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          Environmental Impact
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          CO₂ saved: {currentMetrics.carbonSaved} tons/year • 
                          Energy saved: {currentMetrics.energySaved} kWh/year • 
                          Equivalent to {currentMetrics.equivalent} traditional servers
                        </p>
                      </div>
                      <Battery className="w-6 h-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Growth Chart */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle>Projected Network Growth</CardTitle>
          <p className="text-sm text-muted-foreground">
            Conservative estimates based on 0.01% initial adoption in target markets
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="devices" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.2}
                  name="Connected Devices"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Computational Power Explanation */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle>The Untapped Computing Colossus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Germany's Hidden Supercomputer</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5" />
                  <span>96 million smartphones = 480 PFLOPS potential</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5" />
                  <span>Each phone: 8GB RAM + Neural Processing Unit</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5" />
                  <span>5 trillion operations/second per modern device</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5" />
                  <span>Active during charging (6-8 hours daily)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Traditional Data Center Equivalent</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Server className="w-4 h-4 text-purple-500 mt-0.5" />
                  <span>Cost to build equivalent: €12 billion</span>
                </li>
                <li className="flex items-start gap-2">
                  <Server className="w-4 h-4 text-purple-500 mt-0.5" />
                  <span>Land required: 50 hectares</span>
                </li>
                <li className="flex items-start gap-2">
                  <Server className="w-4 h-4 text-purple-500 mt-0.5" />
                  <span>Power consumption: 200,000 homes worth</span>
                </li>
                <li className="flex items-start gap-2">
                  <Server className="w-4 h-4 text-purple-500 mt-0.5" />
                  <span>Annual CO₂: 300,000 tons</span>
                </li>
              </ul>
            </div>
          </div>

          <Alert className="border-primary/20">
            <Activity className="h-4 w-4" />
            <AlertDescription>
              <strong>Real Performance Metrics:</strong> Our prototype already orchestrates 10,000 devices 
              simultaneously, processing real AI workloads with 60-second fault recovery. Each pool acts 
              as a self-healing neural network that grows stronger with every participant.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Legal Disclaimer */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>* Projections based on market analysis and comparable platform growth rates</p>
        <p>* Actual performance depends on device specifications, network conditions, and user participation</p>
        <p>* Environmental impact calculations based on EU energy grid averages</p>
      </div>
    </div>
  );
}