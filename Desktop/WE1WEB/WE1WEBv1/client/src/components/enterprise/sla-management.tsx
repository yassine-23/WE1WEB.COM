import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Bell,
  Settings,
  Plus,
  FileText,
  Award,
  Target,
  Activity,
  Server,
  Zap,
  Users,
  BarChart3,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface SLAContract {
  id: string;
  organizationId: string;
  poolId?: string;
  tier: 'individual' | 'community' | 'enterprise' | 'custom';
  name: string;
  description: string;
  effectiveDate: Date;
  expirationDate: Date;
  status: 'active' | 'suspended' | 'terminated' | 'pending';
  terms: {
    uptime: {
      guarantee: number;
      measurement: 'monthly' | 'quarterly' | 'annual';
      exclusions: string[];
    };
    performance: {
      maxLatency: number;
      minThroughput: number;
      availability: number;
      measurement: 'monthly' | 'quarterly' | 'annual';
    };
    support: {
      responseTime: number;
      resolutionTime: number;
      coverage: '24/7' | 'business_hours' | 'on_demand';
      channels: string[];
    };
    security: {
      dataEncryption: boolean;
      accessControl: 'rbac' | 'abac' | 'custom';
      auditLogging: boolean;
      complianceStandards: string[];
    };
    credits: {
      uptimeCredits: number;
      performanceCredits: number;
      supportCredits: number;
      maxMonthlyCredits: number;
    };
  };
  currentPeriod: {
    start: Date;
    end: Date;
    metrics: SLAMetrics;
    violations: SLAViolation[];
    credits: SLACredit[];
  };
}

interface SLAMetrics {
  uptime: {
    guaranteed: number;
    measured: number;
    violations: number;
    credits: number;
  };
  performance: {
    maxLatency: number;
    measuredLatency: number;
    minThroughput: number;
    measuredThroughput: number;
    violations: number;
  };
  availability: {
    guaranteed: number;
    measured: number;
    downtime: number;
    violations: number;
  };
  support: {
    responseTime: number;
    resolutionTime: number;
    escalationMatrix: string[];
    measuredResponseTime: number;
    measuredResolutionTime: number;
    violations: number;
  };
  security: {
    dataIntegrity: number;
    accessControlCompliance: number;
    auditCompliance: number;
    breaches: number;
    violations: number;
  };
}

interface SLAViolation {
  id: string;
  contractId: string;
  type: 'uptime' | 'performance' | 'support' | 'security';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  impact: {
    affectedUsers: number;
    downtime: number;
    dataLoss: boolean;
    revenue: number;
  };
  rootCause: string;
  resolution: string;
  credits: number;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

interface SLACredit {
  id: string;
  contractId: string;
  violationId: string;
  type: 'uptime' | 'performance' | 'support' | 'security';
  amount: number;
  reason: string;
  appliedAt: Date;
  status: 'pending' | 'applied' | 'disputed';
}

interface SLADashboard {
  contracts: SLAContract[];
  overview: {
    totalContracts: number;
    activeViolations: number;
    pendingCredits: number;
    complianceRate: number;
  };
  recentViolations: SLAViolation[];
  alerts: string[];
}

export const SLAManagement: React.FC = () => {
  const [dashboard, setDashboard] = useState<SLADashboard | null>(null);
  const [selectedContract, setSelectedContract] = useState<SLAContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViolationDialog, setShowViolationDialog] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<SLAViolation | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSLADashboard();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        loadSLADashboard();
      }, 60000); // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadSLADashboard = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/enterprise/sla/dashboard');
      const data = await response.json();

      if (data.success) {
        setDashboard(data.dashboard);
        if (data.dashboard.contracts.length > 0 && !selectedContract) {
          setSelectedContract(data.dashboard.contracts[0]);
        }
      }

    } catch (error) {
      console.error('Error loading SLA dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSLAReport = async (contractId: string, period: string) => {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarterly':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'annual':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const response = await fetch('/api/enterprise/sla/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId,
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            type: period,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.report.downloadUrl) {
        window.open(data.report.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error generating SLA report:', error);
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'suspended': return 'text-yellow-600';
      case 'terminated': return 'text-red-600';
      case 'pending': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'terminated': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'major': return 'text-orange-600 bg-orange-50';
      case 'minor': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplianceColor = (rate: number): string => {
    if (rate >= 99) return 'text-green-600';
    if (rate >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'individual': return <Users className="h-4 w-4" />;
      case 'community': return <Server className="h-4 w-4" />;
      case 'enterprise': return <Shield className="h-4 w-4" />;
      case 'custom': return <Settings className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
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
          <h2 className="text-2xl font-bold">SLA Management</h2>
          <p className="text-muted-foreground">
            Monitor service level agreements and compliance
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                New SLA Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create SLA Contract</DialogTitle>
                <DialogDescription>
                  Define service level agreement terms and conditions
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  SLA contract creation form will be implemented
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Total Contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.overview.totalContracts}</div>
              <div className="text-xs text-muted-foreground">Active agreements</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Active Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboard.overview.activeViolations}</div>
              <div className="text-xs text-muted-foreground">Require attention</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Pending Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboard.overview.pendingCredits}</div>
              <div className="text-xs text-muted-foreground">Awaiting application</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Compliance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getComplianceColor(dashboard.overview.complianceRate)}`}>
                {formatNumber(dashboard.overview.complianceRate)}%
              </div>
              <Progress value={dashboard.overview.complianceRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {dashboard && dashboard.contracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No SLA Contracts</h3>
            <p className="text-muted-foreground mb-4">
              Create your first SLA contract to start monitoring compliance
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Contract
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contract List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SLA Contracts</h3>
            {dashboard?.contracts.map((contract) => (
              <Card 
                key={contract.id}
                className={`cursor-pointer transition-colors ${
                  selectedContract?.id === contract.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedContract(contract)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTierIcon(contract.tier)}
                      <span className="font-medium">{contract.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(contract.status)}
                      <Badge variant="outline" className={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className={getComplianceColor(contract.currentPeriod.metrics.uptime.measured)}>
                        {formatNumber(contract.currentPeriod.metrics.uptime.measured)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Violations:</span>
                      <span className="text-red-600">{contract.currentPeriod.violations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credits:</span>
                      <span className="text-orange-600">{contract.currentPeriod.credits.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contract Details */}
          {selectedContract && (
            <div className="lg:col-span-3">
              <Tabs defaultValue="overview" className="space-y-4">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="violations">Violations</TabsTrigger>
                    <TabsTrigger value="credits">Credits</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                  </TabsList>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => generateSLAReport(selectedContract.id, 'monthly')}>
                      <Download className="h-4 w-4 mr-2" />
                      Monthly Report
                    </Button>
                    <Button size="sm" variant="outline">
                      <Bell className="h-4 w-4 mr-2" />
                      Configure Alerts
                    </Button>
                  </div>
                </div>

                <TabsContent value="overview" className="space-y-4">
                  {/* Contract Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        {getTierIcon(selectedContract.tier)}
                        <span>{selectedContract.name}</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedContract.tier}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{selectedContract.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Effective Date</div>
                          <div className="font-medium">
                            {new Date(selectedContract.effectiveDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Expiration Date</div>
                          <div className="font-medium">
                            {new Date(selectedContract.expirationDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Current Period</div>
                          <div className="font-medium">
                            {new Date(selectedContract.currentPeriod.start).toLocaleDateString()} - {new Date(selectedContract.currentPeriod.end).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Measurement</div>
                          <div className="font-medium capitalize">
                            {selectedContract.terms.uptime.measurement}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SLA Terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Activity className="h-5 w-5" />
                          <span>Performance Terms</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Uptime Guarantee:</span>
                          <span className="font-medium">{selectedContract.terms.uptime.guarantee}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Latency:</span>
                          <span className="font-medium">{selectedContract.terms.performance.maxLatency}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min Throughput:</span>
                          <span className="font-medium">{selectedContract.terms.performance.minThroughput} tasks/hour</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Availability:</span>
                          <span className="font-medium">{selectedContract.terms.performance.availability}%</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <span>Support Terms</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Response Time:</span>
                          <span className="font-medium">{selectedContract.terms.support.responseTime}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resolution Time:</span>
                          <span className="font-medium">{selectedContract.terms.support.resolutionTime}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coverage:</span>
                          <span className="font-medium">{selectedContract.terms.support.coverage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Channels:</span>
                          <div className="flex space-x-1">
                            {selectedContract.terms.support.channels.map((channel) => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  {/* Current Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Measured:</span>
                            <span className={getComplianceColor(selectedContract.currentPeriod.metrics.uptime.measured)}>
                              {formatNumber(selectedContract.currentPeriod.metrics.uptime.measured)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Guaranteed:</span>
                            <span>{formatNumber(selectedContract.currentPeriod.metrics.uptime.guaranteed)}%</span>
                          </div>
                          <Progress 
                            value={selectedContract.currentPeriod.metrics.uptime.measured} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {selectedContract.currentPeriod.metrics.uptime.violations} violations
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Latency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current:</span>
                            <span className={
                              selectedContract.currentPeriod.metrics.performance.measuredLatency <= selectedContract.terms.performance.maxLatency
                                ? 'text-green-600' : 'text-red-600'
                            }>
                              {formatNumber(selectedContract.currentPeriod.metrics.performance.measuredLatency, 0)}ms
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Max Allowed:</span>
                            <span>{selectedContract.terms.performance.maxLatency}ms</span>
                          </div>
                          <Progress 
                            value={(selectedContract.currentPeriod.metrics.performance.measuredLatency / selectedContract.terms.performance.maxLatency) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {selectedContract.currentPeriod.metrics.performance.violations} violations
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current:</span>
                            <span className={
                              selectedContract.currentPeriod.metrics.performance.measuredThroughput >= selectedContract.terms.performance.minThroughput
                                ? 'text-green-600' : 'text-red-600'
                            }>
                              {formatNumber(selectedContract.currentPeriod.metrics.performance.measuredThroughput, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Min Required:</span>
                            <span>{selectedContract.terms.performance.minThroughput}</span>
                          </div>
                          <Progress 
                            value={(selectedContract.currentPeriod.metrics.performance.measuredThroughput / selectedContract.terms.performance.minThroughput) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            tasks per hour
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Support Response</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Average:</span>
                            <span className={
                              selectedContract.currentPeriod.metrics.support.measuredResponseTime <= selectedContract.terms.support.responseTime
                                ? 'text-green-600' : 'text-red-600'
                            }>
                              {formatNumber(selectedContract.currentPeriod.metrics.support.measuredResponseTime)}h
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>SLA Target:</span>
                            <span>{selectedContract.terms.support.responseTime}h</span>
                          </div>
                          <Progress 
                            value={(selectedContract.currentPeriod.metrics.support.measuredResponseTime / selectedContract.terms.support.responseTime) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {selectedContract.currentPeriod.metrics.support.violations} violations
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Security Compliance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Data Integrity:</span>
                            <span className="text-green-600">
                              {formatNumber(selectedContract.currentPeriod.metrics.security.dataIntegrity)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Access Control:</span>
                            <span className="text-green-600">
                              {formatNumber(selectedContract.currentPeriod.metrics.security.accessControlCompliance)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Audit Compliance:</span>
                            <span className="text-green-600">
                              {formatNumber(selectedContract.currentPeriod.metrics.security.auditCompliance)}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {selectedContract.currentPeriod.metrics.security.breaches} security breaches
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Availability</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current:</span>
                            <span className={getComplianceColor(selectedContract.currentPeriod.metrics.availability.measured)}>
                              {formatNumber(selectedContract.currentPeriod.metrics.availability.measured)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Guaranteed:</span>
                            <span>{formatNumber(selectedContract.currentPeriod.metrics.availability.guaranteed)}%</span>
                          </div>
                          <Progress 
                            value={selectedContract.currentPeriod.metrics.availability.measured} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(selectedContract.currentPeriod.metrics.availability.downtime)} min downtime
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="violations" className="space-y-4">
                  {selectedContract.currentPeriod.violations.length > 0 ? (
                    <div className="space-y-4">
                      {selectedContract.currentPeriod.violations.map((violation) => (
                        <Card key={violation.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Badge className={getSeverityColor(violation.severity)}>
                                  {violation.severity}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {violation.type}
                                </Badge>
                                <span className="font-medium">{violation.description}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(violation.status)}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedViolation(violation);
                                    setShowViolationDialog(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Detected</div>
                                <div>{new Date(violation.detectedAt).toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Affected Users</div>
                                <div>{violation.impact.affectedUsers}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Downtime</div>
                                <div>{formatNumber(violation.impact.downtime)} min</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Credits</div>
                                <div className="text-orange-600">{violation.credits}%</div>
                              </div>
                            </div>

                            {violation.rootCause && (
                              <div className="mt-3 p-3 bg-gray-50 rounded">
                                <div className="text-sm font-medium">Root Cause:</div>
                                <div className="text-sm text-muted-foreground">{violation.rootCause}</div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Violations</h3>
                        <p className="text-muted-foreground">
                          All SLA terms are being met for this contract
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="credits" className="space-y-4">
                  {selectedContract.currentPeriod.credits.length > 0 ? (
                    <div className="space-y-4">
                      {selectedContract.currentPeriod.credits.map((credit) => (
                        <Card key={credit.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="capitalize">
                                    {credit.type}
                                  </Badge>
                                  <span className="font-medium">{credit.amount}%</span>
                                  <Badge className={credit.status === 'applied' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}>
                                    {credit.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">{credit.reason}</div>
                              </div>
                              
                              <div className="text-right space-y-1">
                                <div className="text-sm text-muted-foreground">Applied</div>
                                <div className="text-sm">{new Date(credit.appliedAt).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Credits</h3>
                        <p className="text-muted-foreground">
                          No SLA credits have been earned for this period
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateSLAReport(selectedContract.id, 'monthly')}>
                      <CardContent className="p-6 text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h3 className="font-medium mb-1">Monthly Report</h3>
                        <p className="text-sm text-muted-foreground">Last 30 days compliance</p>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateSLAReport(selectedContract.id, 'quarterly')}>
                      <CardContent className="p-6 text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <h3 className="font-medium mb-1">Quarterly Report</h3>
                        <p className="text-sm text-muted-foreground">Last 3 months trends</p>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateSLAReport(selectedContract.id, 'annual')}>
                      <CardContent className="p-6 text-center">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-medium mb-1">Annual Report</h3>
                        <p className="text-sm text-muted-foreground">Yearly compliance summary</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      )}

      {/* Violation Details Dialog */}
      <Dialog open={showViolationDialog} onOpenChange={setShowViolationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Violation Details</DialogTitle>
            <DialogDescription>
              Complete information about the SLA violation
            </DialogDescription>
          </DialogHeader>
          {selectedViolation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <div className="font-medium capitalize">{selectedViolation.type}</div>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge className={getSeverityColor(selectedViolation.severity)}>
                    {selectedViolation.severity}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <div className="font-medium">{selectedViolation.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Detected At</Label>
                  <div>{new Date(selectedViolation.detectedAt).toLocaleString()}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedViolation.status)}
                    <span className="capitalize">{selectedViolation.status}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Impact</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Affected Users: {selectedViolation.impact.affectedUsers}</div>
                  <div>Downtime: {formatNumber(selectedViolation.impact.downtime)} minutes</div>
                  <div>Data Loss: {selectedViolation.impact.dataLoss ? 'Yes' : 'No'}</div>
                  <div>Revenue Impact: {formatCurrency(selectedViolation.impact.revenue)}</div>
                </div>
              </div>

              {selectedViolation.rootCause && (
                <div>
                  <Label>Root Cause</Label>
                  <div className="text-sm">{selectedViolation.rootCause}</div>
                </div>
              )}

              {selectedViolation.resolution && (
                <div>
                  <Label>Resolution</Label>
                  <div className="text-sm">{selectedViolation.resolution}</div>
                </div>
              )}

              <div>
                <Label>Credits Earned</Label>
                <div className="text-lg font-medium text-orange-600">{selectedViolation.credits}%</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};