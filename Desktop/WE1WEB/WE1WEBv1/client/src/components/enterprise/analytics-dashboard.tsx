import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Server,
  Zap,
  DollarSign,
  Clock,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  Eye,
  Settings,
  Bell,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  Target,
  Award,
  Gauge
} from 'lucide-react';

interface PerformanceMetrics {
  period: {
    start: Date;
    end: Date;
    granularity: string;
  };
  overall: {
    totalComputeHours: number;
    totalTasks: number;
    successRate: number;
    averageLatency: number;
    uptime: number;
    revenue: number;
    costs: number;
    profit: number;
    efficiency: number;
  };
  pools: PoolPerformance[];
  users: UserPerformance[];
  devices: DevicePerformance[];
  trends: TrendData[];
}

interface PoolPerformance {
  poolId: string;
  poolName: string;
  category: string;
  metrics: {
    computeHours: number;
    tasks: number;
    successRate: number;
    members: number;
    revenue: number;
    costs: number;
    utilization: number;
    uptime: number;
    satisfaction: number;
  };
  trends: {
    computeHoursGrowth: number;
    revenueGrowth: number;
    memberGrowth: number;
    satisfactionTrend: number;
  };
}

interface UserPerformance {
  userId: string;
  email: string;
  tier: string;
  metrics: {
    computeHours: number;
    revenue: number;
    efficiency: number;
    reliability: number;
    contribution: number;
    poolsJoined: number;
    tasksCompleted: number;
  };
  rankings: {
    revenueRank: number;
    efficiencyRank: number;
    contributionRank: number;
  };
}

interface DevicePerformance {
  deviceId: string;
  userId: string;
  type: string;
  metrics: {
    uptime: number;
    computeHours: number;
    tasksCompleted: number;
    averageLatency: number;
    errorRate: number;
    revenue: number;
    efficiency: number;
  };
  health: {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  };
}

interface TrendData {
  timestamp: Date;
  metrics: {
    computeHours: number;
    revenue: number;
    activeUsers: number;
    activePools: number;
    taskThroughput: number;
    systemLoad: number;
  };
}

interface RealtimeMetrics {
  computeHours: number;
  revenue: number;
  activeUsers: number;
  activePools: number;
  systemLoad: number;
  taskThroughput: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedView, setSelectedView] = useState('overview');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    loadRealtimeMetrics();
  }, [timeRange]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        loadRealtimeMetrics();
      }, 30000); // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);

      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      const response = await fetch('/api/enterprise/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            granularity: timeRange === '24h' ? 'hour' : 'day',
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMetrics(data.metrics);
      }

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealtimeMetrics = async () => {
    try {
      const response = await fetch('/api/enterprise/analytics/realtime');
      const data = await response.json();
      
      if (data.success) {
        setRealtimeMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading realtime metrics:', error);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      const response = await fetch('/api/enterprise/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          timeRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
            granularity: 'day',
          },
          format: 'pdf',
        }),
      });

      const data = await response.json();
      if (data.success && data.report.downloadUrl) {
        window.open(data.report.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 1): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (growth: number): string => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getHealthColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>

          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Analytics Report</DialogTitle>
                <DialogDescription>
                  Choose the type of report you want to generate
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => generateReport('performance')} variant="outline">
                    Performance Report
                  </Button>
                  <Button onClick={() => generateReport('financial')} variant="outline">
                    Financial Report
                  </Button>
                  <Button onClick={() => generateReport('user_activity')} variant="outline">
                    User Activity
                  </Button>
                  <Button onClick={() => generateReport('device_health')} variant="outline">
                    Device Health
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Real-time Metrics Bar */}
      {realtimeMetrics && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(realtimeMetrics.computeHours)}
                </div>
                <div className="text-sm text-muted-foreground">Compute Hours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(realtimeMetrics.revenue)}
                </div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {realtimeMetrics.activeUsers}
                </div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {realtimeMetrics.activePools}
                </div>
                <div className="text-sm text-muted-foreground">Active Pools</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(realtimeMetrics.systemLoad)}%
                </div>
                <div className="text-sm text-muted-foreground">System Load</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">
                  {formatNumber(realtimeMetrics.taskThroughput)}
                </div>
                <div className="text-sm text-muted-foreground">Tasks/Hour</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pools">Pool Analytics</TabsTrigger>
          <TabsTrigger value="users">User Performance</TabsTrigger>
          <TabsTrigger value="devices">Device Health</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Overall Performance Cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Total Compute Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.overall.totalComputeHours)}</div>
                  <div className="text-xs text-muted-foreground">
                    {timeRange} period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.overall.revenue)}</div>
                  <div className="text-xs text-green-600">
                    Profit: {formatCurrency(metrics.overall.profit)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.overall.successRate)}%</div>
                  <Progress value={metrics.overall.successRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    System Uptime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.overall.uptime, 2)}%</div>
                  <div className="text-xs text-muted-foreground">
                    Avg Latency: {formatNumber(metrics.overall.averageLatency)}ms
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Performance Summary */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Tasks</span>
                      <span className="font-medium">{formatNumber(metrics.overall.totalTasks, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Efficiency</span>
                      <span className="font-medium">{formatNumber(metrics.overall.efficiency)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg Latency</span>
                      <span className="font-medium">{formatNumber(metrics.overall.averageLatency)}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cost Efficiency</span>
                      <span className="font-medium text-green-600">
                        {formatNumber((metrics.overall.profit / metrics.overall.revenue) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Pools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.pools.slice(0, 4).map((pool) => (
                      <div key={pool.poolId} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{pool.poolName}</div>
                          <div className="text-sm text-muted-foreground">
                            {pool.metrics.members} members • {formatNumber(pool.metrics.utilization)}% util
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(pool.metrics.revenue)}</div>
                          <div className={`text-sm flex items-center ${getTrendColor(pool.trends.revenueGrowth)}`}>
                            {getTrendIcon(pool.trends.revenueGrowth)}
                            <span className="ml-1">{formatNumber(Math.abs(pool.trends.revenueGrowth))}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          {metrics && (
            <div className="space-y-4">
              {metrics.pools.map((pool) => (
                <Card key={pool.poolId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Server className="h-5 w-5" />
                          <span>{pool.poolName}</span>
                        </CardTitle>
                        <CardDescription>
                          Category: {pool.category} • {pool.metrics.members} members
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {pool.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatNumber(pool.metrics.computeHours)}</div>
                        <div className="text-xs text-muted-foreground">Compute Hours</div>
                        <div className={`text-xs flex items-center justify-center mt-1 ${getTrendColor(pool.trends.computeHoursGrowth)}`}>
                          {getTrendIcon(pool.trends.computeHoursGrowth)}
                          <span className="ml-1">{formatNumber(Math.abs(pool.trends.computeHoursGrowth))}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{pool.metrics.tasks}</div>
                        <div className="text-xs text-muted-foreground">Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatNumber(pool.metrics.successRate)}%</div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatCurrency(pool.metrics.revenue)}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                        <div className={`text-xs flex items-center justify-center mt-1 ${getTrendColor(pool.trends.revenueGrowth)}`}>
                          {getTrendIcon(pool.trends.revenueGrowth)}
                          <span className="ml-1">{formatNumber(Math.abs(pool.trends.revenueGrowth))}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatNumber(pool.metrics.utilization)}%</div>
                        <div className="text-xs text-muted-foreground">Utilization</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatNumber(pool.metrics.uptime, 1)}%</div>
                        <div className="text-xs text-muted-foreground">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatNumber(pool.metrics.satisfaction, 1)}</div>
                        <div className="text-xs text-muted-foreground">Satisfaction</div>
                        <div className={`text-xs flex items-center justify-center mt-1 ${getTrendColor(pool.trends.satisfactionTrend)}`}>
                          {getTrendIcon(pool.trends.satisfactionTrend)}
                          <span className="ml-1">{formatNumber(Math.abs(pool.trends.satisfactionTrend), 2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {metrics && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Revenue Generators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metrics.users
                        .sort((a, b) => b.metrics.revenue - a.metrics.revenue)
                        .slice(0, 5)
                        .map((user, index) => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <div>
                              <div className="font-medium">{user.email}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.tier} tier
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(user.metrics.revenue)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatNumber(user.metrics.computeHours)}h
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Efficient Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metrics.users
                        .sort((a, b) => b.metrics.efficiency - a.metrics.efficiency)
                        .slice(0, 5)
                        .map((user, index) => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <div>
                              <div className="font-medium">{user.email}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.metrics.tasksCompleted} tasks
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatNumber(user.metrics.efficiency)}%</div>
                            <div className="text-sm text-muted-foreground">
                              {formatNumber(user.metrics.reliability)}% reliable
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Contributors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metrics.users
                        .sort((a, b) => b.metrics.contribution - a.metrics.contribution)
                        .slice(0, 5)
                        .map((user, index) => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <div>
                              <div className="font-medium">{user.email}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.metrics.poolsJoined} pools
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatNumber(user.metrics.contribution)}</div>
                            <div className="text-sm text-muted-foreground">
                              contribution score
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          {metrics && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Device Health Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          Healthy
                        </span>
                        <span>{metrics.devices.filter(d => d.health.status === 'healthy').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 text-yellow-600" />
                          Warning
                        </span>
                        <span>{metrics.devices.filter(d => d.health.status === 'warning').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />
                          Critical
                        </span>
                        <span>{metrics.devices.filter(d => d.health.status === 'critical').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Average Uptime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(metrics.devices.reduce((acc, d) => acc + d.metrics.uptime, 0) / metrics.devices.length)}%
                    </div>
                    <Progress 
                      value={metrics.devices.reduce((acc, d) => acc + d.metrics.uptime, 0) / metrics.devices.length} 
                      className="mt-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Device Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(metrics.devices.reduce((acc, d) => acc + d.metrics.revenue, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metrics.devices.length} active devices
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Avg Error Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(metrics.devices.reduce((acc, d) => acc + d.metrics.errorRate, 0) / metrics.devices.length, 2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      System-wide average
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Device List */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.devices.map((device) => (
                      <div key={device.deviceId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {device.type === 'GPU' && <Cpu className="h-5 w-5 text-blue-600" />}
                            {device.type === 'CPU' && <Server className="h-5 w-5 text-green-600" />}
                            {device.type === 'TPU' && <Zap className="h-5 w-5 text-purple-600" />}
                            {device.type === 'Mobile' && <Wifi className="h-5 w-5 text-orange-600" />}
                            <div>
                              <div className="font-medium">{device.deviceId}</div>
                              <div className="text-sm text-muted-foreground">{device.type} • {device.userId}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getHealthIcon(device.health.status)}
                            <Badge variant="outline" className={getHealthColor(device.health.status)}>
                              {device.health.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="font-medium">{formatNumber(device.metrics.uptime)}%</div>
                            <div className="text-xs text-muted-foreground">Uptime</div>
                          </div>
                          <div>
                            <div className="font-medium">{formatNumber(device.metrics.computeHours)}</div>
                            <div className="text-xs text-muted-foreground">Compute Hours</div>
                          </div>
                          <div>
                            <div className="font-medium">{formatCurrency(device.metrics.revenue)}</div>
                            <div className="text-xs text-muted-foreground">Revenue</div>
                          </div>
                          <div>
                            <div className="font-medium">{formatNumber(device.metrics.efficiency)}%</div>
                            <div className="text-xs text-muted-foreground">Efficiency</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {metrics && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    System performance over the selected time period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>Interactive charts will be implemented with a charting library</p>
                      <p className="text-sm">Trends data is available: {metrics.trends.length} data points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Peak Compute Hours</span>
                        <span className="font-medium">
                          {formatNumber(Math.max(...metrics.trends.map(t => t.metrics.computeHours)))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Peak Revenue</span>
                        <span className="font-medium">
                          {formatCurrency(Math.max(...metrics.trends.map(t => t.metrics.revenue)))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Max Active Users</span>
                        <span className="font-medium">
                          {Math.max(...metrics.trends.map(t => t.metrics.activeUsers))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Peak System Load</span>
                        <span className="font-medium">
                          {formatNumber(Math.max(...metrics.trends.map(t => t.metrics.systemLoad)))}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Compute Hours Trend</span>
                        <div className="flex items-center space-x-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>+15.2%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Revenue Growth</span>
                        <div className="flex items-center space-x-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>+12.8%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>User Growth</span>
                        <div className="flex items-center space-x-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>+8.5%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Pool Growth</span>
                        <div className="flex items-center space-x-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>+6.2%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};