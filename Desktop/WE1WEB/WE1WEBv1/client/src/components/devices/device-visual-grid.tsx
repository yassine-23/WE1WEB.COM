import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Cpu, 
  HardDrive, 
  Wifi, 
  Thermometer, 
  DollarSign, 
  Zap, 
  Users,
  Server,
  Smartphone,
  Monitor,
  Laptop
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'mobile' | 'server';
  status: 'online' | 'offline' | 'renting';
  specs: {
    cpu: string;
    ram: string;
    gpu?: string;
    storage: string;
  };
  performance: {
    cpuUsage: number;
    ramUsage: number;
    gpuUsage?: number;
    temperature: number;
    networkSpeed: number;
  };
  earnings: {
    hourlyRate: number;
    totalEarned: number;
    computeUnits: number;
  };
  rental: {
    isRentable: boolean;
    pricePerHour: number;
    currentRenter?: string;
    hoursRented: number;
  };
}

const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Gaming Desktop Pro',
    type: 'desktop',
    status: 'renting',
    specs: {
      cpu: 'Intel i9-13900K',
      ram: '32GB DDR5',
      gpu: 'RTX 4080',
      storage: '2TB NVMe SSD'
    },
    performance: {
      cpuUsage: 78,
      ramUsage: 65,
      gpuUsage: 92,
      temperature: 72,
      networkSpeed: 85
    },
    earnings: {
      hourlyRate: 12.50,
      totalEarned: 234.75,
      computeUnits: 450
    },
    rental: {
      isRentable: true,
      pricePerHour: 15.00,
      currentRenter: 'AI Research Lab',
      hoursRented: 156
    }
  },
  {
    id: '2',
    name: 'MacBook Pro M2',
    type: 'laptop',
    status: 'online',
    specs: {
      cpu: 'Apple M2 Pro',
      ram: '16GB',
      storage: '1TB SSD'
    },
    performance: {
      cpuUsage: 45,
      ramUsage: 52,
      temperature: 65,
      networkSpeed: 92
    },
    earnings: {
      hourlyRate: 8.25,
      totalEarned: 127.50,
      computeUnits: 285
    },
    rental: {
      isRentable: true,
      pricePerHour: 10.00,
      hoursRented: 89
    }
  },
  {
    id: '3',
    name: 'iPhone 15 Pro',
    type: 'mobile',
    status: 'online',
    specs: {
      cpu: 'A17 Pro',
      ram: '8GB',
      storage: '256GB'
    },
    performance: {
      cpuUsage: 28,
      ramUsage: 42,
      temperature: 58,
      networkSpeed: 78
    },
    earnings: {
      hourlyRate: 2.50,
      totalEarned: 45.25,
      computeUnits: 125
    },
    rental: {
      isRentable: true,
      pricePerHour: 3.00,
      hoursRented: 34
    }
  }
];

const DeviceIcon = ({ type }: { type: Device['type'] }) => {
  const iconMap = {
    desktop: Monitor,
    laptop: Laptop,
    mobile: Smartphone,
    server: Server
  };
  const Icon = iconMap[type];
  return <Icon className="w-8 h-8" />;
};

const StatusBadge = ({ status }: { status: Device['status'] }) => {
  const statusConfig = {
    online: { color: 'bg-green-500', text: 'Available' },
    offline: { color: 'bg-gray-500', text: 'Offline' },
    renting: { color: 'bg-blue-500', text: 'Earning' }
  };
  
  const config = statusConfig[status];
  return (
    <Badge className={`${config.color} text-white`}>
      {config.text}
    </Badge>
  );
};

export default function DeviceVisualGrid() {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const toggleRentable = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, rental: { ...device.rental, isRentable: !device.rental.isRentable } }
        : device
    ));
  };

  const totalEarnings = devices.reduce((sum, device) => sum + device.earnings.totalEarned, 0);
  const totalComputeUnits = devices.reduce((sum, device) => sum + device.earnings.computeUnits, 0);
  const activeDevices = devices.filter(d => d.status !== 'offline').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="modern-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Devices</p>
                <p className="text-2xl font-bold">{activeDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Compute Units</p>
                <p className="text-2xl font-bold">{totalComputeUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pool Members</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <Card 
            key={device.id} 
            className={`modern-card cursor-pointer transition-all hover:shadow-lg ${
              selectedDevice?.id === device.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedDevice(device)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DeviceIcon type={device.type} />
                  <div>
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{device.type}</p>
                  </div>
                </div>
                <StatusBadge status={device.status} />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Performance Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center"><Cpu className="w-4 h-4 mr-1" />CPU</span>
                  <span>{device.performance.cpuUsage}%</span>
                </div>
                <Progress value={device.performance.cpuUsage} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span className="flex items-center"><HardDrive className="w-4 h-4 mr-1" />RAM</span>
                  <span>{device.performance.ramUsage}%</span>
                </div>
                <Progress value={device.performance.ramUsage} className="h-2" />
                
                {device.performance.gpuUsage && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center"><Zap className="w-4 h-4 mr-1" />GPU</span>
                      <span>{device.performance.gpuUsage}%</span>
                    </div>
                    <Progress value={device.performance.gpuUsage} className="h-2" />
                  </>
                )}
              </div>

              {/* Earnings & Rental */}
              <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Earnings Rate</span>
                  <span className="text-sm font-bold text-green-600">${device.earnings.hourlyRate}/hr</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Earned</span>
                  <span className="text-sm font-bold">${device.earnings.totalEarned}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Enable Rental</span>
                  <Switch 
                    checked={device.rental.isRentable}
                    onCheckedChange={() => toggleRentable(device.id)}
                  />
                </div>
                
                {device.rental.isRentable && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rental Price</span>
                    <span className="text-sm font-bold text-blue-600">${device.rental.pricePerHour}/hr</span>
                  </div>
                )}
              </div>

              {device.status === 'renting' && device.rental.currentRenter && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Currently rented by: {device.rental.currentRenter}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {device.rental.hoursRented} hours completed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Device Button */}
      <Card className="modern-card border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardContent className="p-8 text-center">
          <Button variant="outline" className="w-full h-20 text-lg">
            <div className="flex flex-col items-center space-y-2">
              <Zap className="w-8 h-8" />
              <span>Connect New Device</span>
            </div>
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Add more devices to increase your earning potential
          </p>
        </CardContent>
      </Card>
    </div>
  );
}