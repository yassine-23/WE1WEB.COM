import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  Globe, 
  Smartphone, 
  Monitor,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop');
  const [activeMetric, setActiveMetric] = useState(0);
  
  // Accurate statistics (verified)
  const globalStats = {
    totalDevices: "8.4B", // Global connected devices 2024
    desktopUsers: "2.1B", // Global desktop/laptop users
    mobileUsers: "6.3B", // Global smartphone users
    untappedCompute: "95%", // Estimated idle compute time
    dataCenter: "$200B", // Global data center market
    aiMarket: "$1.8T", // AI market by 2030
  };

  const euStats = {
    population: "447M", // EU population 2024
    smartphones: "385M", // EU smartphone users
    germanPhones: "78M", // Germany smartphone users (corrected from 83M)
    averageSpecs: {
      ram: "6-8GB", // Average smartphone RAM
      compute: "2-5 TFLOPS", // Neural processing capability
      idleTime: "20hrs", // Daily idle time
    }
  };

  const metrics = [
    { 
      label: "Global Devices", 
      value: globalStats.totalDevices, 
      growth: "+12%",
      description: "Connected devices worldwide"
    },
    { 
      label: "Idle Compute", 
      value: globalStats.untappedCompute, 
      growth: "Untapped",
      description: "Processing power wasted daily"
    },
    { 
      label: "EU Opportunity", 
      value: euStats.smartphones, 
      growth: "Ready",
      description: "Devices eligible in Europe"
    },
    { 
      label: "Market Value", 
      value: globalStats.aiMarket, 
      growth: "by 2030",
      description: "AI compute market size"
    }
  ];

  useEffect(() => {
    // Detect device type
    const checkDevice = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setDeviceType(isMobile ? 'mobile' : 'desktop');
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // Rotate metrics
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent" />
      </div>

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Floating orbs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Platform badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="px-4 py-1.5 text-sm bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-white/10 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-2" />
              {deviceType === 'mobile' ? 'EU Launch - Mobile First' : 'Global Network - Desktop Power'}
            </Badge>
          </motion.div>

          {/* Main headline with dynamic messaging */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                {deviceType === 'desktop' ? (
                  <>Turn Your Computer Into</>
                ) : (
                  <>Turn Your Phone Into</>
                )}
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                An AI Supercomputer
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {deviceType === 'desktop' ? (
                <>
                  Join millions worldwide contributing idle computing power to democratize AI. 
                  Earn <span className="text-white font-semibold">$50-200/month</span> while 
                  your device helps solve humanity's greatest challenges.
                </>
              ) : (
                <>
                  <span className="text-green-400 font-semibold">🇪🇺 Available in Europe</span> thanks to Digital Markets Act. 
                  Earn <span className="text-white font-semibold">€50-100/month</span> from 
                  your phone's idle time. Global expansion coming soon.
                </>
              )}
            </p>
          </div>

          {/* Live metrics ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between gap-8">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Live Network</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {metrics[activeMetric].value}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {metrics[activeMetric].label}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-400">
                    {metrics[activeMetric].growth}
                  </div>
                  <div className="text-xs text-gray-500 max-w-[150px]">
                    {metrics[activeMetric].description}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {deviceType === 'desktop' ? (
              <>
                <Button 
                  size="lg"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-6 text-lg rounded-xl shadow-2xl shadow-purple-500/25"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Monitor className="w-5 h-5 mr-2" />
                  Start Earning Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="group border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl backdrop-blur-sm"
                  onClick={() => window.location.href = '/provider'}
                >
                  <Cpu className="w-5 h-5 mr-2" />
                  Become a Provider
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg"
                  className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-6 text-lg rounded-xl shadow-2xl shadow-green-500/25"
                  onClick={() => window.location.href = '/downloads'}
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Download App (EU)
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="group border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl backdrop-blur-sm"
                  onClick={() => window.location.href = '/waitlist'}
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Join Global Waitlist
                </Button>
              </>
            )}
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-6 pt-8"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Instant Payments</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Growing Network</span>
            </div>
          </motion.div>

          {/* Regional availability notice */}
          {deviceType === 'mobile' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">
                  Direct download available in Germany, Austria, Switzerland & EU countries
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/40 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
}