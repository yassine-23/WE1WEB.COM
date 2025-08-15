import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Crown,
  TrendingUp,
  DollarSign,
  Users,
  Server,
  Zap,
  Shield,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Download,
  CreditCard
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'individual' | 'community' | 'enterprise';
  pricing: {
    monthlyBase: number;
    computeHourRate: number;
    storageGbRate: number;
    networkGbRate: number;
    apiCallRate: number;
  };
  limits: {
    maxComputeHours: number;
    maxStorageGb: number;
    maxNetworkGb: number;
    maxApiCalls: number;
    maxDevices: number;
    maxPools: number;
    maxConcurrentTasks: number;
  };
  features: {
    prioritySupport: boolean;
    dedicatedAccount: boolean;
    customIntegrations: boolean;
    advancedAnalytics: boolean;
    slaGuarantees: boolean;
    whiteLabeling: boolean;
    onPremiseDeployment: boolean;
    customContracts: boolean;
  };
  sla: {
    uptime: number;
    responseTime: number;
    dataRetention: number;
  };
}

interface UsageMetrics {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  computeHours: number;
  storageGb: number;
  networkGb: number;
  apiCalls: number;
  activeDevices: number;
  activePools: number;
  concurrentTasks: number;
  revenue: number;
  costs: number;
}

interface LimitCheck {
  withinLimits: boolean;
  violations: string[];
  recommendations: string[];
}

interface BillingCycle {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  charges: {
    baseSubscription: number;
    computeOverage: number;
    storageOverage: number;
    networkOverage: number;
    apiOverage: number;
    totalAmount: number;
    discounts: number;
    taxes: number;
    finalAmount: number;
  };
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'disputed';
  invoiceUrl?: string;
  paidAt?: Date;
}

export const PricingDashboard: React.FC = () => {
  const [currentTier, setCurrentTier] = useState<PricingTier | null>(null);
  const [allTiers, setAllTiers] = useState<PricingTier[]>([]);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [limitCheck, setLimitCheck] = useState<LimitCheck | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    try {
      setIsLoading(true);

      // Load current tier and usage
      const [tierResponse, usageResponse, tiersResponse, billingResponse] = await Promise.all([
        fetch('/api/enterprise/user/tier'),
        fetch('/api/enterprise/user/usage'),
        fetch('/api/enterprise/pricing-tiers'),
        fetch('/api/enterprise/user/billing-history'),
      ]);

      const tierData = await tierResponse.json();
      const usageData = await usageResponse.json();
      const tiersData = await tiersResponse.json();
      const billingData = await billingResponse.json();

      if (tierData.success) {
        setCurrentTier(tierData.tier);
      }

      if (usageData.success) {
        setUsage(usageData.usage);
        setLimitCheck(usageData.limitCheck);
      }

      if (tiersData.success) {
        setAllTiers(tiersData.tiers);
      }

      if (billingData.success) {
        setBillingHistory(billingData.billingHistory);
      }

      // Load upgrade recommendations
      const recResponse = await fetch('/api/enterprise/user/upgrade-recommendations');
      const recData = await recResponse.json();
      if (recData.success) {
        setRecommendations(recData.recommendations);
      }

    } catch (error) {
      console.error('Error loading pricing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeTier = async (tierId: string) => {
    try {
      const response = await fetch('/api/enterprise/user/tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId }),
      });

      const data = await response.json();
      if (data.success) {
        setShowUpgradeDialog(false);
        await loadPricingData();
      }
    } catch (error) {
      console.error('Error upgrading tier:', error);
    }
  };

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTierIcon = (category: string) => {
    switch (category) {
      case 'individual': return <Users className="h-5 w-5" />;
      case 'community': return <Server className="h-5 w-5" />;
      case 'enterprise': return <Crown className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'disputed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
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
          <h2 className="text-2xl font-bold">Pricing & Billing</h2>
          <p className="text-muted-foreground">
            Manage your subscription and monitor usage
          </p>
        </div>

        {currentTier && recommendations?.recommendedTier && (
          <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upgrade Your Plan</DialogTitle>
                <DialogDescription>
                  Get more features and higher limits with an upgraded plan
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Current Tier */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center space-x-2">
                        {getTierIcon(currentTier.category)}
                        <span>Current: {currentTier.displayName}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(currentTier.pricing.monthlyBase)}
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommended Tier */}
                  <Card className="ring-2 ring-primary">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center space-x-2">
                        {getTierIcon(recommendations.recommendedTier.category)}
                        <span>Recommended: {recommendations.recommendedTier.displayName}</span>
                        <Badge>Recommended</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(recommendations.recommendedTier.pricing.monthlyBase)}
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Why upgrade?</h4>
                  <ul className="space-y-1">
                    {recommendations.reasons.map((reason: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                    Maybe Later
                  </Button>
                  <Button onClick={() => upgradeTier(recommendations.recommendedTier.id)}>
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Current Tier Overview */}
      {currentTier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getTierIcon(currentTier.category)}
              <span>Current Plan: {currentTier.displayName}</span>
              <Badge variant="outline" className="capitalize">
                {currentTier.category}
              </Badge>
            </CardTitle>
            <CardDescription>{currentTier.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(currentTier.pricing.monthlyBase)}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Base</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(currentTier.pricing.computeHourRate)}
                </div>
                <div className="text-sm text-muted-foreground">Per Compute Hour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {currentTier.sla.uptime}%
                </div>
                <div className="text-sm text-muted-foreground">SLA Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {currentTier.sla.responseTime}h
                </div>
                <div className="text-sm text-muted-foreground">Support Response</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="plans">Compare Plans</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          {/* Usage Alerts */}
          {limitCheck && !limitCheck.withinLimits && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Usage Limit Exceeded</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {limitCheck.violations.map((violation, index) => (
                    <div key={index} className="text-sm text-red-700">
                      • {violation}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-red-800 mb-2">Recommendations:</h4>
                  <div className="space-y-1">
                    {limitCheck.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm text-red-700">
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Metrics */}
          {usage && currentTier && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Compute Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{usage.computeHours.toFixed(1)} used</span>
                      <span>{currentTier.limits.maxComputeHours === -1 ? 'Unlimited' : currentTier.limits.maxComputeHours}</span>
                    </div>
                    {currentTier.limits.maxComputeHours !== -1 && (
                      <Progress 
                        value={getUsagePercentage(usage.computeHours, currentTier.limits.maxComputeHours)}
                        className="h-2"
                      />
                    )}
                    <div className={`text-xs ${getUsageColor(getUsagePercentage(usage.computeHours, currentTier.limits.maxComputeHours))}`}>
                      {getUsagePercentage(usage.computeHours, currentTier.limits.maxComputeHours).toFixed(1)}% used
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{usage.storageGb.toFixed(1)} GB</span>
                      <span>{currentTier.limits.maxStorageGb === -1 ? 'Unlimited' : `${currentTier.limits.maxStorageGb} GB`}</span>
                    </div>
                    {currentTier.limits.maxStorageGb !== -1 && (
                      <Progress 
                        value={getUsagePercentage(usage.storageGb, currentTier.limits.maxStorageGb)}
                        className="h-2"
                      />
                    )}
                    <div className={`text-xs ${getUsageColor(getUsagePercentage(usage.storageGb, currentTier.limits.maxStorageGb))}`}>
                      {getUsagePercentage(usage.storageGb, currentTier.limits.maxStorageGb).toFixed(1)}% used
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{usage.activeDevices} devices</span>
                      <span>{currentTier.limits.maxDevices === -1 ? 'Unlimited' : currentTier.limits.maxDevices}</span>
                    </div>
                    {currentTier.limits.maxDevices !== -1 && (
                      <Progress 
                        value={getUsagePercentage(usage.activeDevices, currentTier.limits.maxDevices)}
                        className="h-2"
                      />
                    )}
                    <div className={`text-xs ${getUsageColor(getUsagePercentage(usage.activeDevices, currentTier.limits.maxDevices))}`}>
                      {getUsagePercentage(usage.activeDevices, currentTier.limits.maxDevices).toFixed(1)}% used
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(usage.revenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      This period
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          {billingHistory.length > 0 ? (
            <div className="space-y-4">
              {billingHistory.map((billing) => (
                <Card key={billing.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(billing.status)}
                          <span className="font-medium">
                            {new Date(billing.period.start).toLocaleDateString()} - {new Date(billing.period.end).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="capitalize">
                            {billing.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Billing Cycle: {billing.id}
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-2xl font-bold">
                          {formatCurrency(billing.charges.finalAmount)}
                        </div>
                        <div className="flex space-x-2">
                          {billing.invoiceUrl && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                          )}
                          {billing.status === 'pending' && (
                            <Button size="sm">
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Billing Breakdown */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Base Subscription</div>
                          <div className="font-medium">{formatCurrency(billing.charges.baseSubscription)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Compute Overage</div>
                          <div className="font-medium">{formatCurrency(billing.charges.computeOverage)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Discounts</div>
                          <div className="font-medium text-green-600">-{formatCurrency(billing.charges.discounts)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Taxes</div>
                          <div className="font-medium">{formatCurrency(billing.charges.taxes)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Billing History</h3>
                <p className="text-muted-foreground">
                  Your billing history will appear here once you have invoices
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTiers.map((tier) => (
              <Card key={tier.id} className={`${currentTier?.id === tier.id ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTierIcon(tier.category)}
                      <span>{tier.displayName}</span>
                    </div>
                    {currentTier?.id === tier.id && (
                      <Badge>Current</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">
                        {formatCurrency(tier.pricing.monthlyBase)}
                        <span className="text-lg font-normal text-muted-foreground">/month</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        + {formatCurrency(tier.pricing.computeHourRate)}/compute hour
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compute Hours</span>
                        <span>{tier.limits.maxComputeHours === -1 ? 'Unlimited' : tier.limits.maxComputeHours}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Storage</span>
                        <span>{tier.limits.maxStorageGb === -1 ? 'Unlimited' : `${tier.limits.maxStorageGb} GB`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Devices</span>
                        <span>{tier.limits.maxDevices === -1 ? 'Unlimited' : tier.limits.maxDevices}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>SLA Uptime</span>
                        <span>{tier.sla.uptime}%</span>
                      </div>
                    </div>

                    {currentTier?.id !== tier.id && (
                      <Button 
                        className="w-full"
                        variant={tier.category === 'enterprise' ? 'default' : 'outline'}
                        onClick={() => upgradeTier(tier.id)}
                      >
                        {tier.category === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          {currentTier && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security & Compliance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>SLA Guarantees</span>
                      {currentTier.features.slaGuarantees ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Priority Support</span>
                      {currentTier.features.prioritySupport ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dedicated Account Manager</span>
                      {currentTier.features.dedicatedAccount ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics & Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Advanced Analytics</span>
                      {currentTier.features.advancedAnalytics ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Custom Integrations</span>
                      {currentTier.features.customIntegrations ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>White Labeling</span>
                      {currentTier.features.whiteLabeling ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>On-Premise Deployment</span>
                      {currentTier.features.onPremiseDeployment ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};