import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Server,
  Plus,
  Users,
  Shield,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Settings,
  Globe,
  Zap,
  Monitor,
  TrendingUp,
  Eye,
  UserPlus,
  Activity
} from 'lucide-react';

interface PoolTemplate {
  id: string;
  name: string;
  description: string;
  useCase: string;
  estimatedCosts: {
    setup: number;
    monthly: number;
    perComputeHour: number;
  };
  features: string[];
  compliance: string[];
}

interface EnterprisePool {
  id: string;
  name: string;
  description: string;
  tier: 'enterprise' | 'premium' | 'custom';
  configuration: {
    isolation: 'shared' | 'dedicated' | 'hybrid';
    geography: string[];
    compliance: string[];
  };
  resources: {
    totalComputeHours: number;
    allocatedComputeHours: number;
    availableComputeHours: number;
    totalCosts: number;
    costPerHour: number;
  };
  members: Array<{
    userId: string;
    email: string;
    role: string;
    usage: {
      computeHours: number;
      costs: number;
    };
  }>;
  metrics: {
    performance: {
      averageLatency: number;
      uptime: number;
      throughput: number;
      errorRate: number;
    };
    efficiency: {
      utilization: number;
      costEfficiency: number;
      taskSuccessRate: number;
    };
  };
  sla: {
    uptime: {
      guaranteed: number;
      measured: number;
    };
    performance: {
      maxLatency: number;
      measured: {
        latency: number;
      };
    };
  };
}

export const EnterprisePoolManagement: React.FC = () => {
  const [pools, setPools] = useState<EnterprisePool[]>([]);
  const [templates, setTemplates] = useState<PoolTemplate[]>([]);
  const [selectedPool, setSelectedPool] = useState<EnterprisePool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);

  // Create pool form state
  const [newPool, setNewPool] = useState({
    templateId: '',
    name: '',
    description: '',
    budget: 10000,
    isolation: 'hybrid' as const,
    geography: ['us-east'],
    compliance: ['SOC2'],
  });

  // Add member form state
  const [newMember, setNewMember] = useState({
    userId: '',
    email: '',
    role: 'analyst' as const,
    department: '',
    computeHours: 100,
    storageGb: 50,
    priority: 5,
  });

  useEffect(() => {
    loadPoolData();
  }, []);

  const loadPoolData = async () => {
    try {
      setIsLoading(true);

      const [poolsResponse, templatesResponse] = await Promise.all([
        fetch('/api/enterprise/pools'),
        fetch('/api/enterprise/pools/templates'),
      ]);

      const poolsData = await poolsResponse.json();
      const templatesData = await templatesResponse.json();

      if (poolsData.success) {
        setPools(poolsData.pools);
        if (poolsData.pools.length > 0 && !selectedPool) {
          setSelectedPool(poolsData.pools[0]);
        }
      }

      if (templatesData.success) {
        setTemplates(templatesData.templates);
      }

    } catch (error) {
      console.error('Error loading pool data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPool = async () => {
    try {
      const response = await fetch('/api/enterprise/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: newPool.templateId,
          name: newPool.name,
          description: newPool.description,
          budget: newPool.budget,
          configuration: {
            isolation: newPool.isolation,
            geography: newPool.geography,
            compliance: newPool.compliance,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateDialog(false);
        setNewPool({
          templateId: '',
          name: '',
          description: '',
          budget: 10000,
          isolation: 'hybrid',
          geography: ['us-east'],
          compliance: ['SOC2'],
        });
        await loadPoolData();
      }
    } catch (error) {
      console.error('Error creating pool:', error);
    }
  };

  const addMember = async () => {
    if (!selectedPool) return;

    try {
      const response = await fetch(`/api/enterprise/pools/${selectedPool.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newMember.userId,
          email: newMember.email,
          role: newMember.role,
          department: newMember.department,
          quotas: {
            computeHours: newMember.computeHours,
            storageGb: newMember.storageGb,
            priority: newMember.priority,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowMemberDialog(false);
        setNewMember({
          userId: '',
          email: '',
          role: 'analyst',
          department: '',
          computeHours: 100,
          storageGb: 50,
          priority: 5,
        });
        await loadPoolData();
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const getIsolationColor = (isolation: string) => {
    switch (isolation) {
      case 'dedicated': return 'bg-purple-500';
      case 'hybrid': return 'bg-blue-500';
      case 'shared': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSLAStatus = (pool: EnterprisePool) => {
    const uptimeOk = pool.sla.uptime.measured >= pool.sla.uptime.guaranteed;
    const latencyOk = pool.sla.performance.measured.latency <= pool.sla.performance.maxLatency;
    
    if (uptimeOk && latencyOk) return { status: 'healthy', color: 'text-green-600', icon: CheckCircle };
    if (!uptimeOk || !latencyOk) return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'critical', color: 'text-red-600', icon: AlertTriangle };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
          <h2 className="text-2xl font-bold">Enterprise Pool Management</h2>
          <p className="text-muted-foreground">
            Manage your organization's computing pools and resources
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Pool
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Enterprise Pool</DialogTitle>
              <DialogDescription>
                Create a new computing pool from a template
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Pool Template</Label>
                <Select value={newPool.templateId} onValueChange={(value) => setNewPool(prev => ({ ...prev, templateId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {formatCurrency(template.estimatedCosts.monthly)}/month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Pool Name</Label>
                  <Input
                    id="name"
                    value={newPool.name}
                    onChange={(e) => setNewPool(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Enterprise Pool"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newPool.budget}
                    onChange={(e) => setNewPool(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                    min={1000}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPool.description}
                  onChange={(e) => setNewPool(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Pool description and use case..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isolation">Isolation Level</Label>
                  <Select value={newPool.isolation} onValueChange={(value: any) => setNewPool(prev => ({ ...prev, isolation: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shared">Shared (Cost-effective)</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Balanced)</SelectItem>
                      <SelectItem value="dedicated">Dedicated (Maximum security)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Compliance Requirements</Label>
                  <div className="flex flex-wrap gap-2">
                    {['SOC2', 'ISO27001', 'HIPAA', 'PCI', 'GDPR'].map((compliance) => (
                      <Badge
                        key={compliance}
                        variant={newPool.compliance.includes(compliance) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          setNewPool(prev => ({
                            ...prev,
                            compliance: prev.compliance.includes(compliance)
                              ? prev.compliance.filter(c => c !== compliance)
                              : [...prev.compliance, compliance]
                          }));
                        }}
                      >
                        {compliance}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createPool} disabled={!newPool.templateId || !newPool.name}>
                  Create Pool
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pools.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Enterprise Pools</h3>
            <p className="text-muted-foreground mb-4">
              Create your first enterprise computing pool to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Pool
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Pool List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Pools</h3>
            {pools.map((pool) => {
              const slaStatus = getSLAStatus(pool);
              return (
                <Card 
                  key={pool.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPool?.id === pool.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPool(pool)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4" />
                        <span className="font-medium">{pool.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <slaStatus.icon className={`h-4 w-4 ${slaStatus.color}`} />
                        <Badge variant="outline" className={getIsolationColor(pool.configuration.isolation)}>
                          {pool.configuration.isolation}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Members:</span>
                        <span>{pool.members.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilization:</span>
                        <span>{pool.metrics.efficiency.utilization.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Cost:</span>
                        <span>{formatCurrency(pool.resources.totalCosts)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pool Details */}
          {selectedPool && (
            <div className="lg:col-span-3">
              <Tabs defaultValue="overview" className="space-y-4">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="sla">SLA Monitoring</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Pool Member</DialogTitle>
                        <DialogDescription>
                          Add a new member to {selectedPool.name}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="memberEmail">Email</Label>
                            <Input
                              id="memberEmail"
                              type="email"
                              value={newMember.email}
                              onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="user@company.com"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="memberRole">Role</Label>
                            <Select value={newMember.role} onValueChange={(value: any) => setNewMember(prev => ({ ...prev, role: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="analyst">Analyst</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="department">Department (Optional)</Label>
                          <Input
                            id="department"
                            value={newMember.department}
                            onChange={(e) => setNewMember(prev => ({ ...prev, department: e.target.value }))}
                            placeholder="Engineering, Data Science, etc."
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Compute Hours Quota</Label>
                            <Input
                              type="number"
                              value={newMember.computeHours}
                              onChange={(e) => setNewMember(prev => ({ ...prev, computeHours: parseInt(e.target.value) }))}
                              min={1}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Storage Quota (GB)</Label>
                            <Input
                              type="number"
                              value={newMember.storageGb}
                              onChange={(e) => setNewMember(prev => ({ ...prev, storageGb: parseInt(e.target.value) }))}
                              min={1}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Priority (1-10)</Label>
                            <Input
                              type="number"
                              value={newMember.priority}
                              onChange={(e) => setNewMember(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                              min={1}
                              max={10}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowMemberDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={addMember} disabled={!newMember.email}>
                            Add Member
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <TabsContent value="overview" className="space-y-4">
                  {/* Pool Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          Utilization
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{selectedPool.metrics.efficiency.utilization.toFixed(1)}%</div>
                        <Progress value={selectedPool.metrics.efficiency.utilization} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Monthly Costs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(selectedPool.resources.totalCosts)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(selectedPool.resources.costPerHour)}/hour
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Members
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{selectedPool.members.length}</div>
                        <div className="text-xs text-muted-foreground">
                          Active users
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Success Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{selectedPool.metrics.efficiency.taskSuccessRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">
                          Task completion
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Configuration Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Settings className="h-5 w-5" />
                          <span>Configuration</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Isolation:</span>
                          <Badge className={getIsolationColor(selectedPool.configuration.isolation)}>
                            {selectedPool.configuration.isolation}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Geography:</span>
                          <div className="flex space-x-1">
                            {selectedPool.configuration.geography.map((region) => (
                              <Badge key={region} variant="outline">{region}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Compliance:</span>
                          <div className="flex space-x-1">
                            {selectedPool.configuration.compliance.map((comp) => (
                              <Badge key={comp} variant="outline">{comp}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Monitor className="h-5 w-5" />
                          <span>Performance</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Uptime:</span>
                          <span className="font-medium">{selectedPool.metrics.performance.uptime.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Latency:</span>
                          <span className="font-medium">{selectedPool.metrics.performance.averageLatency.toFixed(0)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Throughput:</span>
                          <span className="font-medium">{selectedPool.metrics.performance.throughput.toFixed(0)} tasks/hour</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Error Rate:</span>
                          <span className="font-medium">{selectedPool.metrics.performance.errorRate.toFixed(2)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="members" className="space-y-4">
                  <div className="space-y-4">
                    {selectedPool.members.map((member) => (
                      <Card key={member.userId}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">{member.email}</div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{member.role}</Badge>
                              </div>
                            </div>
                            
                            <div className="text-right space-y-1">
                              <div className="text-sm text-muted-foreground">
                                {member.usage.computeHours.toFixed(1)} compute hours
                              </div>
                              <div className="text-sm font-medium">
                                {formatCurrency(member.usage.costs)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {selectedPool.members.length === 0 && (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Members Yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Add team members to start using this pool
                          </p>
                          <Button onClick={() => setShowMemberDialog(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add First Member
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Analytics</CardTitle>
                      <CardDescription>
                        Detailed analytics and insights for {selectedPool.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Advanced analytics coming soon
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sla" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <span>SLA Status</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Uptime Guarantee</span>
                          <div className="text-right">
                            <div className="font-medium">{selectedPool.sla.uptime.guaranteed}%</div>
                            <div className="text-sm text-muted-foreground">
                              Current: {selectedPool.sla.uptime.measured.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span>Max Latency</span>
                          <div className="text-right">
                            <div className="font-medium">{selectedPool.sla.performance.maxLatency}ms</div>
                            <div className="text-sm text-muted-foreground">
                              Current: {selectedPool.sla.performance.measured.latency.toFixed(0)}ms
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          {getSLAStatus(selectedPool).status === 'healthy' ? (
                            <Badge className="bg-green-500">SLA Compliant</Badge>
                          ) : (
                            <Badge variant="destructive">SLA Violation</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>SLA History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            SLA monitoring history will appear here
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pool Settings</CardTitle>
                      <CardDescription>
                        Configure and manage pool settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Pool configuration settings coming soon
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      )}
    </div>
  );
};