import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Server, 
  Users, 
  Cpu, 
  HardDrive,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemMetrics {
  cpu: { usage: number; cores: number };
  memory: { used: number; total: number; percentage: number };
  disk: { used: number; total: number; percentage: number };
  network: { rx: number; tx: number };
}

interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  latency?: number;
}

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function MonitoringDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [requestMetrics, setRequestMetrics] = useState<any>(null);
  const [applicationMetrics, setApplicationMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      
      const [system, health, activeAlerts, requests, app] = await Promise.all([
        fetch('/api/metrics/system').then(res => res.json()),
        fetch('/api/health/detailed').then(res => res.json()),
        fetch('/api/alerts/active').then(res => res.json()),
        fetch('/api/metrics/requests?hours=1').then(res => res.json()),
        fetch('/api/metrics/application').then(res => res.json())
      ]);

      setSystemMetrics(system);
      setServiceHealth(health.services);
      setAlerts(activeAlerts.alerts);
      setRequestMetrics(requests);
      setApplicationMetrics(app);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <Alert key={alert.id} variant={getSeverityColor(alert.severity) as any}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="capitalize">{alert.severity} Alert</AlertTitle>
              <AlertDescription>
                {alert.message}
                <span className="text-xs text-muted-foreground ml-2">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Service Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
          <CardDescription>Real-time status of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {serviceHealth.map(service => (
              <div key={service.service} className="text-center">
                <div className={`text-2xl mb-1 ${getStatusColor(service.status)}`}>
                  {service.status === 'healthy' ? (
                    <CheckCircle className="h-8 w-8 mx-auto" />
                  ) : service.status === 'degraded' ? (
                    <AlertTriangle className="h-8 w-8 mx-auto" />
                  ) : (
                    <AlertCircle className="h-8 w-8 mx-auto" />
                  )}
                </div>
                <div className="font-medium capitalize">{service.service}</div>
                {service.latency && (
                  <div className="text-xs text-muted-foreground">
                    {service.latency.toFixed(0)}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System Resources</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* CPU Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemMetrics?.cpu.usage.toFixed(1)}%
                </div>
                <Progress value={systemMetrics?.cpu.usage || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {systemMetrics?.cpu.cores} cores
                </p>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemMetrics?.memory.percentage.toFixed(1)}%
                </div>
                <Progress value={systemMetrics?.memory.percentage || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {formatBytes(systemMetrics?.memory.used || 0)} / {formatBytes(systemMetrics?.memory.total || 0)}
                </p>
              </CardContent>
            </Card>

            {/* Disk Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemMetrics?.disk.percentage.toFixed(1)}%
                </div>
                <Progress value={systemMetrics?.disk.percentage || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {formatBytes(systemMetrics?.disk.used || 0)} / {formatBytes(systemMetrics?.disk.total || 0)}
                </p>
              </CardContent>
            </Card>

            {/* Network I/O */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <div className="text-xs text-muted-foreground mt-2">
                  <div>RX: {(systemMetrics?.network.rx || 0).toFixed(2)} MB/s</div>
                  <div>TX: {(systemMetrics?.network.tx || 0).toFixed(2)} MB/s</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Active Users */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applicationMetrics?.activeUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {applicationMetrics?.activeSessions || 0} sessions
                </p>
              </CardContent>
            </Card>

            {/* Job Queue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Queue</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applicationMetrics?.jobQueue.pending || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Processing: {applicationMetrics?.jobQueue.processing || 0}
                </p>
              </CardContent>
            </Card>

            {/* Compute Nodes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compute Nodes</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applicationMetrics?.computeNodes.online || 0}/{applicationMetrics?.computeNodes.total || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {applicationMetrics?.computeNodes.utilization || 0}% utilized
                </p>
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applicationMetrics?.marketplace.transactionsToday || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Volume: ${applicationMetrics?.marketplace.volumeToday || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Request Performance</CardTitle>
              <CardDescription>Response time statistics for the last hour</CardDescription>
            </CardHeader>
            <CardContent>
              {requestMetrics && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium">Total Requests</div>
                      <div className="text-2xl font-bold">{requestMetrics.totalRequests}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Avg Response Time</div>
                      <div className="text-2xl font-bold">
                        {requestMetrics.summary.average.toFixed(0)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">P95 Response Time</div>
                      <div className="text-2xl font-bold">
                        {requestMetrics.summary.p95.toFixed(0)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">P99 Response Time</div>
                      <div className="text-2xl font-bold">
                        {requestMetrics.summary.p99.toFixed(0)}ms
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Tracking</CardTitle>
              <CardDescription>Error statistics and recent errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Error tracking data will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}