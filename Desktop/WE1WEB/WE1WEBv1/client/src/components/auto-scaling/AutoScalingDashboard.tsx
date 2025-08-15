/**
 * Auto-Scaling Dashboard Component
 * Provides comprehensive monitoring and control interface for auto-scaling infrastructure
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Settings,
  TrendingUp,
  TrendingDown,
  Warning,
  Error,
  Info,
  CheckCircle,
  CloudQueue,
  Memory,
  Speed,
  AttachMoney,
  Timeline,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { io, Socket } from 'socket.io-client';

interface AutoScalingStatus {
  isRunning: boolean;
  currentNodes: number;
  nodeDistribution: Record<string, number>;
  metrics: ResourceMetrics | null;
  lastScaling: ScalingAction | null;
  costStatus: {
    hourlySpend: number;
    dailySpend: number;
    monthlySpend: number;
    projectedMonthly: number;
  };
  policies: ScalingPolicies;
}

interface ResourceMetrics {
  provider: string;
  region: string;
  timestamp: Date;
  cpuUtilization: number;
  memoryUtilization: number;
  gpuUtilization?: number;
  taskQueueLength?: number;
  activeNodes: number;
  averageTaskWaitTime?: number;
  networkLatency?: number;
  throughput?: number;
  errorRate?: number;
  availability?: number;
  costPerHour?: number;
  efficiency?: number;
}

interface ScalingAction {
  id: string;
  timestamp: Date;
  action: 'scale-up' | 'scale-down';
  fromNodes: number;
  toNodes: number;
  actualToNodes?: number;
  reason: string;
  status: 'in-progress' | 'completed' | 'failed' | 'partial-failure';
  error?: string;
}

interface ScalingPolicies {
  minNodes: number;
  maxNodes: number;
  targetCPUUtilization: number;
  targetMemoryUtilization: number;
  targetGPUUtilization: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number;
  maxScaleUpRate: number;
  maxScaleDownRate: number;
}

interface ProviderStatus {
  enabled: boolean;
  healthy: boolean;
  nodeCount: number;
  regions: string[];
  instances: Array<{
    id: string;
    type: string;
    region: string;
    status: string;
    launchTime: Date;
    cost: number;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`auto-scaling-tabpanel-${index}`}
    aria-labelledby={`auto-scaling-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AutoScalingDashboard: React.FC = () => {
  const [status, setStatus] = useState<AutoScalingStatus | null>(null);
  const [providerStatuses, setProviderStatuses] = useState<Record<string, ProviderStatus>>({});
  const [metricsHistory, setMetricsHistory] = useState<ResourceMetrics[]>([]);
  const [scalingHistory, setScalingHistory] = useState<ScalingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Dialog states
  const [scaleDialogOpen, setScaleDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [targetNodes, setTargetNodes] = useState<number>(0);
  const [policies, setPolicies] = useState<Partial<ScalingPolicies>>({});
  
  // Tab state
  const [currentTab, setCurrentTab] = useState(0);

  // Colors for charts
  const colors = {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    aws: '#ff9900',
    gcp: '#4285f4',
    azure: '#0078d4',
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('/auto-scaling');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to auto-scaling WebSocket');
    });

    newSocket.on('metrics-update', (data: ResourceMetrics) => {
      setMetricsHistory(prev => [...prev.slice(-99), data]); // Keep last 100 metrics
    });

    newSocket.on('scaling-started', (action: ScalingAction) => {
      setScalingHistory(prev => [action, ...prev.slice(0, 49)]); // Keep last 50 actions
    });

    newSocket.on('scaling-completed', (action: ScalingAction) => {
      setScalingHistory(prev =>
        prev.map(a => a.id === action.id ? action : a)
      );
    });

    newSocket.on('alert', (alert: any) => {
      // Handle alerts
      console.log('Auto-scaling alert:', alert);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch status
      const statusResponse = await fetch('/api/auto-scaling/status');
      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        setStatus(statusData.data);
      }

      // Fetch provider statuses
      const providers = ['aws', 'gcp', 'azure'];
      const providerPromises = providers.map(async provider => {
        try {
          const response = await fetch(`/api/auto-scaling/providers/${provider}/status`);
          const data = await response.json();
          return { provider, status: data.success ? data.data : null };
        } catch (error) {
          return { provider, status: null };
        }
      });

      const providerResults = await Promise.all(providerPromises);
      const newProviderStatuses: Record<string, ProviderStatus> = {};
      providerResults.forEach(({ provider, status }) => {
        if (status) {
          newProviderStatuses[provider] = status;
        }
      });
      setProviderStatuses(newProviderStatuses);

      // Fetch scaling history
      const historyResponse = await fetch('/api/auto-scaling/history');
      const historyData = await historyResponse.json();
      
      if (historyData.success) {
        setScalingHistory(historyData.data.history);
      }

      // Fetch metrics
      const metricsResponse = await fetch('/api/auto-scaling/metrics?timeRange=24h');
      const metricsData = await metricsResponse.json();
      
      if (metricsData.success && metricsData.data.currentMetrics) {
        setMetricsHistory([metricsData.data.currentMetrics]);
      }

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle start/stop auto-scaling
  const handleToggleAutoScaling = async () => {
    try {
      const endpoint = status?.isRunning ? '/api/auto-scaling/stop' : '/api/auto-scaling/start';
      const response = await fetch(endpoint, { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        fetchData();
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Handle manual scaling
  const handleManualScale = async () => {
    try {
      const response = await fetch('/api/auto-scaling/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetNodes }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setScaleDialogOpen(false);
        fetchData();
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Handle policy updates
  const handleUpdatePolicies = async () => {
    try {
      const response = await fetch('/api/auto-scaling/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policies),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettingsDialogOpen(false);
        setPolicies({});
        fetchData();
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Calculate metrics for charts
  const latestMetrics = status?.metrics;
  const utilizationData = latestMetrics ? [
    { name: 'CPU', value: latestMetrics.cpuUtilization, color: colors.primary },
    { name: 'Memory', value: latestMetrics.memoryUtilization, color: colors.secondary },
    { name: 'GPU', value: latestMetrics.gpuUtilization || 0, color: colors.success },
  ] : [];

  const nodeDistributionData = status ? Object.entries(status.nodeDistribution).map(([provider, count]) => ({
    name: provider.toUpperCase(),
    value: count,
    color: colors[provider as keyof typeof colors] || colors.primary,
  })) : [];

  const costTrendData = status ? [
    { name: 'Hourly', amount: status.costStatus.hourlySpend },
    { name: 'Daily', amount: status.costStatus.dailySpend },
    { name: 'Monthly', amount: status.costStatus.monthlySpend },
    { name: 'Projected', amount: status.costStatus.projectedMonthly },
  ] : [];

  if (loading && !status) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Auto-Scaling Dashboard</Typography>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Auto-Scaling Dashboard
        </Typography>
        <Box>
          <IconButton onClick={fetchData} title="Refresh">
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={status?.isRunning ? <Stop /> : <PlayArrow />}
            onClick={handleToggleAutoScaling}
            color={status?.isRunning ? "error" : "primary"}
            sx={{ ml: 1 }}
          >
            {status?.isRunning ? 'Stop' : 'Start'} Auto-Scaling
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => setSettingsDialogOpen(true)}
            sx={{ ml: 1 }}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Status Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CloudQueue color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Nodes
                  </Typography>
                  <Typography variant="h4">
                    {status?.currentNodes || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Speed color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    CPU Utilization
                  </Typography>
                  <Typography variant="h4">
                    {latestMetrics?.cpuUtilization.toFixed(1) || '0.0'}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Memory color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Memory Usage
                  </Typography>
                  <Typography variant="h4">
                    {latestMetrics?.memoryUtilization.toFixed(1) || '0.0'}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Hourly Cost
                  </Typography>
                  <Typography variant="h4">
                    ${status?.costStatus.hourlySpend.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)}>
          <Tab label="Overview" />
          <Tab label="Metrics" />
          <Tab label="Providers" />
          <Tab label="History" />
          <Tab label="Cost Analysis" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {/* Resource Utilization */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Resource Utilization</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={utilizationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  >
                    {utilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>

            {/* Node Distribution */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Node Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={nodeDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {nodeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  onClick={() => {
                    setTargetNodes((status?.currentNodes || 0) + 5);
                    setScaleDialogOpen(true);
                  }}
                >
                  Scale Up
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingDown />}
                  onClick={() => {
                    setTargetNodes(Math.max(0, (status?.currentNodes || 0) - 5));
                    setScaleDialogOpen(true);
                  }}
                  disabled={(status?.currentNodes || 0) <= 0}
                >
                  Scale Down
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchData}
                >
                  Refresh Data
                </Button>
              </Box>
            </Grid>

            {/* Status Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>System Status</Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip
                  icon={status?.isRunning ? <CheckCircle /> : <Warning />}
                  label={`Auto-Scaling: ${status?.isRunning ? 'Active' : 'Inactive'}`}
                  color={status?.isRunning ? 'success' : 'warning'}
                />
                <Chip
                  icon={<Info />}
                  label={`Last Action: ${status?.lastScaling ? new Date(status.lastScaling.timestamp).toLocaleString() : 'None'}`}
                  color="info"
                />
                <Chip
                  icon={<Timeline />}
                  label={`Queue Length: ${latestMetrics?.taskQueueLength || 0}`}
                  color="default"
                />
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Metrics Tab */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Resource Metrics Over Time</Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <RechartsTooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cpuUtilization" 
                    stroke={colors.primary} 
                    name="CPU %" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memoryUtilization" 
                    stroke={colors.secondary} 
                    name="Memory %" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gpuUtilization" 
                    stroke={colors.success} 
                    name="GPU %" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Providers Tab */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            {Object.entries(providerStatuses).map(([provider, providerStatus]) => (
              <Grid item xs={12} md={4} key={provider}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">{provider.toUpperCase()}</Typography>
                      <Chip
                        label={providerStatus.enabled ? 'Enabled' : 'Disabled'}
                        color={providerStatus.enabled ? 'success' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Nodes: {providerStatus.nodeCount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Regions: {providerStatus.regions.join(', ')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Health: {providerStatus.healthy ? '✅ Healthy' : '❌ Unhealthy'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>Scaling History</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>From → To</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scalingHistory.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      {new Date(action.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={action.action === 'scale-up' ? <TrendingUp /> : <TrendingDown />}
                        label={action.action}
                        color={action.action === 'scale-up' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {action.fromNodes} → {action.actualToNodes || action.toNodes}
                    </TableCell>
                    <TableCell>{action.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={action.status}
                        color={
                          action.status === 'completed' ? 'success' :
                          action.status === 'failed' ? 'error' :
                          action.status === 'partial-failure' ? 'warning' : 'info'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Cost Analysis Tab */}
        <TabPanel value={currentTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Bar dataKey="amount" fill={colors.primary} />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Cost Summary</Typography>
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Current Hourly:</strong> ${status?.costStatus.hourlySpend.toFixed(2)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Daily Spend:</strong> ${status?.costStatus.dailySpend.toFixed(2)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Monthly Spend:</strong> ${status?.costStatus.monthlySpend.toFixed(2)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Projected Monthly:</strong> ${status?.costStatus.projectedMonthly.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Manual Scale Dialog */}
      <Dialog open={scaleDialogOpen} onClose={() => setScaleDialogOpen(false)}>
        <DialogTitle>Manual Scaling</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Target Node Count"
            type="number"
            fullWidth
            variant="outlined"
            value={targetNodes}
            onChange={(e) => setTargetNodes(parseInt(e.target.value) || 0)}
            inputProps={{ min: 0, max: status?.policies.maxNodes || 100 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Current: {status?.currentNodes || 0} nodes
            <br />
            Range: {status?.policies.minNodes || 0} - {status?.policies.maxNodes || 100} nodes
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScaleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleManualScale} variant="contained">Scale</Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Auto-Scaling Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Min Nodes"
                type="number"
                fullWidth
                variant="outlined"
                value={policies.minNodes || status?.policies.minNodes || 0}
                onChange={(e) => setPolicies({ ...policies, minNodes: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max Nodes"
                type="number"
                fullWidth
                variant="outlined"
                value={policies.maxNodes || status?.policies.maxNodes || 100}
                onChange={(e) => setPolicies({ ...policies, maxNodes: parseInt(e.target.value) || 100 })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Target CPU Utilization (%)"
                type="number"
                fullWidth
                variant="outlined"
                value={policies.targetCPUUtilization || status?.policies.targetCPUUtilization || 70}
                onChange={(e) => setPolicies({ ...policies, targetCPUUtilization: parseFloat(e.target.value) || 70 })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Target Memory Utilization (%)"
                type="number"
                fullWidth
                variant="outlined"
                value={policies.targetMemoryUtilization || status?.policies.targetMemoryUtilization || 80}
                onChange={(e) => setPolicies({ ...policies, targetMemoryUtilization: parseFloat(e.target.value) || 80 })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Scale Up Threshold"
                type="number"
                fullWidth
                variant="outlined"
                inputProps={{ step: 0.1, min: 0, max: 1 }}
                value={policies.scaleUpThreshold || status?.policies.scaleUpThreshold || 0.7}
                onChange={(e) => setPolicies({ ...policies, scaleUpThreshold: parseFloat(e.target.value) || 0.7 })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Scale Down Threshold"
                type="number"
                fullWidth
                variant="outlined"
                inputProps={{ step: 0.1, min: 0, max: 1 }}
                value={policies.scaleDownThreshold || status?.policies.scaleDownThreshold || 0.3}
                onChange={(e) => setPolicies({ ...policies, scaleDownThreshold: parseFloat(e.target.value) || 0.3 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdatePolicies} variant="contained">Update Settings</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AutoScalingDashboard;