import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Monitor,
  Laptop,
  Smartphone,
  Wifi,
  WifiOff,
  Activity,
  Zap,
  Link,
  Unlink,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Globe,
  Shield,
  Cpu,
  HardDrive,
  Network,
  Cloud,
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';

interface SyncedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'mobile';
  os: string;
  status: 'online' | 'offline' | 'syncing';
  lastSeen: Date;
  resources: {
    cpu: { usage: number; cores: number; speed: number };
    memory: { used: number; total: number };
    gpu?: { model: string; usage: number };
    network: { upload: number; download: number; latency: number };
  };
  contribution: {
    tasksCompleted: number;
    dataGenerated: number; // MB
    earnings: number;
    uptime: number; // hours
  };
  syncQuality: number; // 0-100%
}

interface NetworkOptimization {
  mode: 'balanced' | 'performance' | 'economy';
  bandwidth: {
    allocated: number; // Mbps
    used: number;
    efficiency: number; // percentage
  };
  routing: 'direct' | 'relay' | 'mesh';
  compression: boolean;
  deduplication: boolean;
}

export default function DeviceSyncDashboard() {
  const [syncCode, setSyncCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [devices, setDevices] = useState<SyncedDevice[]>([]);
  const [optimization, setOptimization] = useState<NetworkOptimization>({
    mode: 'balanced',
    bandwidth: { allocated: 100, used: 0, efficiency: 0 },
    routing: 'direct',
    compression: true,
    deduplication: true
  });
  const [totalResources, setTotalResources] = useState({
    cpu: 0,
    memory: 0,
    bandwidth: 0,
    power: 0 // TFLOPS
  });

  // Generate sync code and QR
  useEffect(() => {
    const code = generateSyncCode();
    setSyncCode(code);
    generateQRCode(code);
    
    // Simulate some connected devices
    simulateDevices();
  }, []);

  // Update network stats
  useEffect(() => {
    const interval = setInterval(() => {
      updateNetworkStats();
      updateDeviceStats();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [devices]);

  const generateSyncCode = (): string => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WE1-${code}-${Date.now().toString(36).toUpperCase()}`;
  };

  const generateQRCode = async (code: string) => {
    try {
      const url = await QRCode.toDataURL(`we1web://sync/${code}`, {
        width: 200,
        margin: 1,
        color: { dark: '#FFFFFF', light: '#000000' }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  };

  const simulateDevices = () => {
    const initialDevices: SyncedDevice[] = [
      {
        id: 'current-device',
        name: 'This Device (Browser)',
        type: 'laptop',
        os: navigator.platform,
        status: 'online',
        lastSeen: new Date(),
        resources: {
          cpu: { usage: 25, cores: navigator.hardwareConcurrency || 4, speed: 2.5 },
          memory: { used: 4, total: 8 },
          network: { upload: 10, download: 50, latency: 20 }
        },
        contribution: {
          tasksCompleted: 142,
          dataGenerated: 256,
          earnings: 2.45,
          uptime: 12
        },
        syncQuality: 100
      }
    ];
    setDevices(initialDevices);
    calculateTotalResources(initialDevices);
  };

  const addDevice = (type: 'desktop' | 'laptop' | 'mobile') => {
    const newDevice: SyncedDevice = {
      id: `device-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${devices.length + 1}`,
      type,
      os: type === 'desktop' ? 'Windows' : type === 'laptop' ? 'macOS' : 'Android',
      status: 'syncing',
      lastSeen: new Date(),
      resources: {
        cpu: { 
          usage: Math.random() * 50, 
          cores: type === 'desktop' ? 8 : type === 'laptop' ? 4 : 2,
          speed: type === 'desktop' ? 3.5 : type === 'laptop' ? 2.5 : 1.8
        },
        memory: { 
          used: Math.random() * 8, 
          total: type === 'desktop' ? 16 : type === 'laptop' ? 8 : 4
        },
        network: { 
          upload: Math.random() * 20, 
          download: Math.random() * 100, 
          latency: Math.random() * 50 
        },
        ...(type === 'desktop' && {
          gpu: { model: 'NVIDIA RTX 3060', usage: Math.random() * 60 }
        })
      },
      contribution: {
        tasksCompleted: Math.floor(Math.random() * 500),
        dataGenerated: Math.random() * 500,
        earnings: Math.random() * 10,
        uptime: Math.random() * 100
      },
      syncQuality: 75 + Math.random() * 25
    };
    
    setDevices(prev => {
      const updated = [...prev, newDevice];
      calculateTotalResources(updated);
      return updated;
    });
    
    // Simulate sync completion
    setTimeout(() => {
      setDevices(prev => 
        prev.map(d => d.id === newDevice.id ? { ...d, status: 'online' } : d)
      );
    }, 2000);
  };

  const removeDevice = (deviceId: string) => {
    setDevices(prev => {
      const updated = prev.filter(d => d.id !== deviceId);
      calculateTotalResources(updated);
      return updated;
    });
  };

  const calculateTotalResources = (deviceList: SyncedDevice[]) => {
    const total = deviceList.reduce((acc, device) => {
      const cpuPower = device.resources.cpu.cores * device.resources.cpu.speed;
      return {
        cpu: acc.cpu + device.resources.cpu.cores,
        memory: acc.memory + device.resources.memory.total,
        bandwidth: acc.bandwidth + device.resources.network.upload + device.resources.network.download,
        power: acc.power + cpuPower
      };
    }, { cpu: 0, memory: 0, bandwidth: 0, power: 0 });
    
    setTotalResources(total);
  };

  const updateNetworkStats = () => {
    setOptimization(prev => ({
      ...prev,
      bandwidth: {
        ...prev.bandwidth,
        used: Math.min(prev.bandwidth.allocated, prev.bandwidth.used + Math.random() * 20 - 5),
        efficiency: 75 + Math.random() * 20
      }
    }));
  };

  const updateDeviceStats = () => {
    setDevices(prev => prev.map(device => ({
      ...device,
      resources: {
        ...device.resources,
        cpu: { ...device.resources.cpu, usage: Math.max(0, Math.min(100, device.resources.cpu.usage + Math.random() * 20 - 10)) },
        network: {
          upload: Math.max(0, device.resources.network.upload + Math.random() * 10 - 5),
          download: Math.max(0, device.resources.network.download + Math.random() * 30 - 15),
          latency: Math.max(10, Math.min(100, device.resources.network.latency + Math.random() * 10 - 5))
        }
      },
      contribution: {
        ...device.contribution,
        tasksCompleted: device.contribution.tasksCompleted + (Math.random() > 0.7 ? 1 : 0),
        dataGenerated: device.contribution.dataGenerated + Math.random() * 2,
        earnings: device.contribution.earnings + Math.random() * 0.01
      }
    })));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDeviceIcon = (type: string) => {
    switch(type) {
      case 'desktop': return Monitor;
      case 'laptop': return Laptop;
      case 'mobile': return Smartphone;
      default: return Monitor;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'syncing': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sync Setup Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10">
        <CardHeader>
          <CardTitle className="text-2xl">Device Sync Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Quick Sync</h3>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                {qrCodeUrl && <img src={qrCodeUrl} alt="Sync QR Code" className="w-48 h-48" />}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan with WE1WEB mobile app or enter code manually
              </p>
            </div>
            
            {/* Manual Sync Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Manual Sync Code</h3>
              <div className="flex gap-2">
                <Input value={syncCode} readOnly className="font-mono" />
                <Button onClick={copyToClipboard} variant="outline">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Add Device Manually</Label>
                <div className="flex gap-2">
                  <Button onClick={() => addDevice('desktop')} variant="outline" size="sm">
                    <Monitor className="h-4 w-4 mr-1" /> Desktop
                  </Button>
                  <Button onClick={() => addDevice('laptop')} variant="outline" size="sm">
                    <Laptop className="h-4 w-4 mr-1" /> Laptop
                  </Button>
                  <Button onClick={() => addDevice('mobile')} variant="outline" size="sm">
                    <Smartphone className="h-4 w-4 mr-1" /> Mobile
                  </Button>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All connections are end-to-end encrypted using WebRTC. 
                  Your devices communicate directly without routing through servers.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combined Resources Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Combined Computing Power</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg">
              <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{totalResources.cpu}</div>
              <div className="text-sm text-muted-foreground">CPU Cores</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg">
              <HardDrive className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{totalResources.memory} GB</div>
              <div className="text-sm text-muted-foreground">Total RAM</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg">
              <Network className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{totalResources.bandwidth.toFixed(0)} Mbps</div>
              <div className="text-sm text-muted-foreground">Bandwidth</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{totalResources.power.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">TFLOPS</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Synced Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {devices.map((device) => {
                const Icon = getDeviceIcon(device.type);
                return (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-primary" />
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-muted-foreground">{device.os}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(device.status)}>
                          {device.status === 'online' && <Wifi className="h-3 w-3 mr-1" />}
                          {device.status === 'offline' && <WifiOff className="h-3 w-3 mr-1" />}
                          {device.status}
                        </Badge>
                        {device.id !== 'current-device' && (
                          <Button
                            onClick={() => removeDevice(device.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">CPU</div>
                        <Progress value={device.resources.cpu.usage} className="h-1 mt-1" />
                        <div className="text-xs mt-1">{device.resources.cpu.usage.toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Memory</div>
                        <Progress value={(device.resources.memory.used / device.resources.memory.total) * 100} className="h-1 mt-1" />
                        <div className="text-xs mt-1">{device.resources.memory.used.toFixed(1)}/{device.resources.memory.total} GB</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Network</div>
                        <div className="flex items-center gap-1 text-xs mt-1">
                          <Upload className="h-3 w-3" /> {device.resources.network.upload.toFixed(0)}
                          <Download className="h-3 w-3 ml-2" /> {device.resources.network.download.toFixed(0)} Mbps
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Earnings</div>
                        <div className="text-green-400 font-medium">${device.contribution.earnings.toFixed(3)}</div>
                      </div>
                    </div>
                    
                    {device.resources.gpu && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">GPU: {device.resources.gpu.model}</span>
                          <span>{device.resources.gpu.usage.toFixed(0)}% usage</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Network Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>Bandwidth Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Optimization Mode</Label>
              <div className="flex gap-2">
                {['economy', 'balanced', 'performance'].map(mode => (
                  <Button
                    key={mode}
                    variant={optimization.mode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOptimization(prev => ({ ...prev, mode: mode as any }))}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bandwidth Usage</span>
                <span>{optimization.bandwidth.used.toFixed(0)}/{optimization.bandwidth.allocated} Mbps</span>
              </div>
              <Progress value={(optimization.bandwidth.used / optimization.bandwidth.allocated) * 100} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm">Compression</span>
                <Badge variant={optimization.compression ? 'default' : 'secondary'}>
                  {optimization.compression ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm">Deduplication</span>
                <Badge variant={optimization.deduplication ? 'default' : 'secondary'}>
                  {optimization.deduplication ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
            
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                Network efficiency: <strong>{optimization.bandwidth.efficiency.toFixed(0)}%</strong>. 
                Your devices are automatically routed through the optimal path for minimal latency and maximum throughput.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}