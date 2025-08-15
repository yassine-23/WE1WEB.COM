import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Smartphone, 
  Battery, 
  Wifi, 
  Cpu, 
  MemoryStick, 
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  Activity,
  Network,
  Zap,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface MobileDevice {
  deviceId: string;
  nickname: string;
  deviceModel: string;
  osVersion: string;
  totalEarnings: number;
  reliabilityScore: number;
  tasksCompleted: number;
  isActive: boolean;
  batteryLevel: number;
  isCharging: boolean;
  networkType: string;
  status: 'online' | 'offline' | 'working' | 'paused';
}

interface DeviceCapabilities {
  deviceModel: string;
  osVersion: string;
  cpuCores: number;
  ramMb: number;
  storageGb: number;
  hasGpu: boolean;
  webglSupport: boolean;
  wasmSupport: boolean;
  batteryCapacity: number;
  screenResolution: string;
  sensors: string[];
}

interface DeviceConstraints {
  maxBatteryUsage: number;
  maxDataUsage: number;
  maxCpuUsage: number;
  onlyWhileCharging: boolean;
  onlyOnWifi: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  temperatureThreshold: number;
}

interface EarningsPotential {
  hourly: number;
  daily: number;
  monthly: number;
  factors: {
    devicePerformance: number;
    networkQuality: number;
    availability: number;
    reliabilityBonus: number;
  };
}

export const MobileDeviceManager: React.FC = () => {
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MobileDevice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [earningsPotential, setEarningsPotential] = useState<EarningsPotential | null>(null);

  // Registration form state
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    deviceModel: '',
    osVersion: '',
    cpuCores: 4,
    ramMb: 4096,
    storageGb: 64,
    hasGpu: true,
    webglSupport: true,
    wasmSupport: true,
    batteryCapacity: 3000,
    screenResolution: '1920x1080',
    sensors: ['accelerometer', 'gyroscope', 'camera'],
  });

  const [constraints, setConstraints] = useState<DeviceConstraints>({
    maxBatteryUsage: 20,
    maxDataUsage: 1000,
    maxCpuUsage: 70,
    onlyWhileCharging: false,
    onlyOnWifi: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
    },
    temperatureThreshold: 45,
  });

  useEffect(() => {
    loadUserDevices();
    detectDeviceCapabilities();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      loadEarningsPotential(selectedDevice.deviceId);
    }
  }, [selectedDevice]);

  const loadUserDevices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/mobile/user/devices');
      const data = await response.json();
      
      if (data.success) {
        setDevices(data.devices);
        if (data.devices.length > 0 && !selectedDevice) {
          setSelectedDevice(data.devices[0]);
        }
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectDeviceCapabilities = async () => {
    try {
      // Auto-detect device capabilities using Web APIs
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      
      // Detect device model and OS
      if (userAgent.includes('iPhone')) {
        setCapabilities(prev => ({
          ...prev,
          deviceModel: 'iPhone',
          osVersion: 'iOS 17',
        }));
      } else if (userAgent.includes('Android')) {
        setCapabilities(prev => ({
          ...prev,
          deviceModel: 'Android Device',
          osVersion: 'Android 13',
        }));
      } else {
        setCapabilities(prev => ({
          ...prev,
          deviceModel: 'Web Browser',
          osVersion: userAgent.split(' ').pop() || 'Unknown',
        }));
      }

      // Detect hardware capabilities
      const memory = (navigator as any).deviceMemory || 4;
      const cores = navigator.hardwareConcurrency || 4;
      
      setCapabilities(prev => ({
        ...prev,
        cpuCores: cores,
        ramMb: memory * 1024,
        webglSupport: !!document.createElement('canvas').getContext('webgl'),
        wasmSupport: typeof WebAssembly !== 'undefined',
      }));

    } catch (error) {
      console.error('Error detecting capabilities:', error);
    }
  };

  const registerDevice = async () => {
    try {
      const response = await fetch('/api/mobile/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capabilities, constraints }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowRegisterDialog(false);
        await loadUserDevices();
      } else {
        console.error('Registration failed:', data.error);
      }
    } catch (error) {
      console.error('Error registering device:', error);
    }
  };

  const loadEarningsPotential = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/mobile/${deviceId}/earnings-potential`);
      const data = await response.json();
      
      if (data.success) {
        setEarningsPotential(data.potential);
      }
    } catch (error) {
      console.error('Error loading earnings potential:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'working': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'working': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'paused': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'offline': return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
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
          <h2 className="text-2xl font-bold">Mobile Device Manager</h2>
          <p className="text-muted-foreground">
            Manage your mobile devices and optimize earnings
          </p>
        </div>
        
        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register Mobile Device</DialogTitle>
              <DialogDescription>
                Register your mobile device to start earning with WE1WEB
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Device Capabilities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Device Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deviceModel">Device Model</Label>
                    <Input
                      id="deviceModel"
                      value={capabilities.deviceModel}
                      onChange={(e) => setCapabilities(prev => ({ ...prev, deviceModel: e.target.value }))}
                      placeholder="iPhone 15 Pro"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="osVersion">OS Version</Label>
                    <Input
                      id="osVersion"
                      value={capabilities.osVersion}
                      onChange={(e) => setCapabilities(prev => ({ ...prev, osVersion: e.target.value }))}
                      placeholder="iOS 17.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpuCores">CPU Cores</Label>
                    <Input
                      id="cpuCores"
                      type="number"
                      value={capabilities.cpuCores}
                      onChange={(e) => setCapabilities(prev => ({ ...prev, cpuCores: parseInt(e.target.value) }))}
                      min={1}
                      max={16}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ramMb">RAM (MB)</Label>
                    <Input
                      id="ramMb"
                      type="number"
                      value={capabilities.ramMb}
                      onChange={(e) => setCapabilities(prev => ({ ...prev, ramMb: parseInt(e.target.value) }))}
                      min={512}
                      max={32768}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hardware Features</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={capabilities.hasGpu}
                        onCheckedChange={(checked) => setCapabilities(prev => ({ ...prev, hasGpu: checked }))}
                      />
                      <span>GPU Support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={capabilities.webglSupport}
                        onCheckedChange={(checked) => setCapabilities(prev => ({ ...prev, webglSupport: checked }))}
                      />
                      <span>WebGL</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={capabilities.wasmSupport}
                        onCheckedChange={(checked) => setCapabilities(prev => ({ ...prev, wasmSupport: checked }))}
                      />
                      <span>WebAssembly</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Constraints */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Usage Constraints</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Max Battery Usage: {constraints.maxBatteryUsage}%</Label>
                    <Slider
                      value={[constraints.maxBatteryUsage]}
                      onValueChange={([value]) => setConstraints(prev => ({ ...prev, maxBatteryUsage: value }))}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Max Data Usage: {constraints.maxDataUsage} MB/day</Label>
                    <Slider
                      value={[constraints.maxDataUsage]}
                      onValueChange={([value]) => setConstraints(prev => ({ ...prev, maxDataUsage: value }))}
                      max={5000}
                      step={100}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={constraints.onlyWhileCharging}
                        onCheckedChange={(checked) => setConstraints(prev => ({ ...prev, onlyWhileCharging: checked }))}
                      />
                      <span>Only while charging</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={constraints.onlyOnWifi}
                        onCheckedChange={(checked) => setConstraints(prev => ({ ...prev, onlyOnWifi: checked }))}
                      />
                      <span>Only on WiFi</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={constraints.quietHours.enabled}
                      onCheckedChange={(checked) => setConstraints(prev => ({ 
                        ...prev, 
                        quietHours: { ...prev.quietHours, enabled: checked }
                      }))}
                    />
                    <span>Enable quiet hours</span>
                  </div>

                  {constraints.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="quietStart">Start Time</Label>
                        <Input
                          id="quietStart"
                          type="time"
                          value={constraints.quietHours.start}
                          onChange={(e) => setConstraints(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, start: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quietEnd">End Time</Label>
                        <Input
                          id="quietEnd"
                          type="time"
                          value={constraints.quietHours.end}
                          onChange={(e) => setConstraints(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, end: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={registerDevice}>
                  Register Device
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Mobile Devices</h3>
            <p className="text-muted-foreground mb-4">
              Register your mobile device to start earning with WE1WEB
            </p>
            <Button onClick={() => setShowRegisterDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Device
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Devices</h3>
            {devices.map((device) => (
              <Card 
                key={device.deviceId}
                className={`cursor-pointer transition-colors ${
                  selectedDevice?.deviceId === device.deviceId ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedDevice(device)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium">{device.nickname}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(device.status)}
                      <Badge variant="outline" className={getStatusColor(device.status)}>
                        {device.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {device.deviceModel}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Earned: ${device.totalEarnings.toFixed(2)}</span>
                    <span>⭐ {device.reliabilityScore.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Device Details */}
          {selectedDevice && (
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Device Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Device Status</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Battery className="h-4 w-4" />
                            <span className="text-sm">Battery: {selectedDevice.batteryLevel}%</span>
                          </div>
                          <Progress value={selectedDevice.batteryLevel} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Wifi className="h-4 w-4" />
                            <span className="text-sm">Network: {selectedDevice.networkType}</span>
                          </div>
                          <Badge variant="outline">
                            {selectedDevice.isCharging ? 'Charging' : 'On Battery'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Earnings Potential */}
                  {earningsPotential && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5" />
                          <span>Earnings Potential</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              ${earningsPotential.hourly.toFixed(3)}
                            </div>
                            <div className="text-sm text-muted-foreground">Per Hour</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              ${earningsPotential.daily.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">Per Day</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              ${earningsPotential.monthly.toFixed(0)}
                            </div>
                            <div className="text-sm text-muted-foreground">Per Month</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Device Performance</span>
                            <span>{(earningsPotential.factors.devicePerformance * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={earningsPotential.factors.devicePerformance * 100} className="h-2" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Network Quality</span>
                            <span>{(earningsPotential.factors.networkQuality * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={earningsPotential.factors.networkQuality * 100} className="h-2" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Availability</span>
                            <span>{(earningsPotential.factors.availability * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={earningsPotential.factors.availability * 100} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Cpu className="h-4 w-4" />
                            <span className="text-sm">CPU Usage</span>
                          </div>
                          <Progress value={45} className="h-2" />
                          <span className="text-xs text-muted-foreground">45% average</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MemoryStick className="h-4 w-4" />
                            <span className="text-sm">Memory Usage</span>
                          </div>
                          <Progress value={60} className="h-2" />
                          <span className="text-xs text-muted-foreground">60% average</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-bold">{selectedDevice.tasksCompleted}</div>
                          <div className="text-sm text-muted-foreground">Tasks Completed</div>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-bold">{selectedDevice.reliabilityScore.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">Reliability Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="earnings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Earnings History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">
                            ${selectedDevice.totalEarnings.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Earned</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-lg font-bold">$2.50</div>
                            <div className="text-sm text-muted-foreground">Last 24h</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-lg font-bold">$18.75</div>
                            <div className="text-sm text-muted-foreground">Last 7 days</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Device Settings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Auto-join pools</div>
                            <div className="text-sm text-muted-foreground">
                              Automatically join optimal computing pools
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Background processing</div>
                            <div className="text-sm text-muted-foreground">
                              Continue earning when device is idle
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Location sharing</div>
                            <div className="text-sm text-muted-foreground">
                              Share location for mesh networking
                            </div>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Battery optimization mode</Label>
                          <select className="w-full p-2 border rounded-md">
                            <option value="balanced">Balanced</option>
                            <option value="aggressive">Battery Saver</option>
                            <option value="performance">Performance</option>
                          </select>
                        </div>
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