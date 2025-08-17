import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cpu, Rocket, DollarSign, Users, Zap, Download, Settings, Coins, Globe, Brain, Shield, Wifi, Activity } from "lucide-react";
import EarthGlobe from "@/components/ui/earth-globe";
import TypingAnimation from "@/components/ui/typing-animation";
import MissionStatement from "@/components/mission/MissionStatement";
import NetworkProjections from "@/components/projections/NetworkProjections";
import HeroSection from "@/components/hero/HeroSection";
import { motion } from "framer-motion";

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Real-time simulated stats (will be replaced with actual data)
  const stats = [
    { label: "Active Nodes", value: "Pre-Launch", color: "text-cyan-300" },
    { label: "Target Q1 2025", value: "5,000", color: "text-green-300" },
    { label: "EU Ready", value: "385M", color: "text-purple-300" },
    { label: "Network Status", value: "Building", color: "text-blue-300" },
  ];

  const typingPhrases = [
    "Passive Income",
    "AI Revolution", 
    "Digital Assets",
    "Crypto Rewards",
    "Computing Power",
    "Future Wealth",
    "Blockchain Income",
    "Neural Networks",
    "Decentralized Earnings"
  ];

  const features = [
    {
      icon: Globe,
      title: "World's Largest Data Processing Network",
      description: "Building the largest distributed supercomputer by uniting every unused device worldwide - from smartphones to servers",
      color: "text-cyan-300"
    },
    {
      icon: Brain,
      title: "AI-Powered Optimization",
      description: "Advanced algorithms automatically optimize your hardware for maximum earnings",
      color: "text-purple-300"
    },
    {
      icon: Shield,
      title: "Secure & Trustless",
      description: "Blockchain-secured transactions with built-in reputation systems",
      color: "text-green-300"
    },
    {
      icon: Wifi,
      title: "Real-time Monitoring",
      description: "Live dashboard showing earnings, performance metrics, and network status",
      color: "text-blue-300"
    }
  ];

  const steps = [
    {
      icon: Download,
      title: "Deploy Agent",
      description: "Install our quantum-secured compute agent with auto-discovery protocols",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Settings,
      title: "Configure Matrix", 
      description: "Set resource allocation parameters and availability windows",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Coins,
      title: "Harvest Rewards",
      description: "Watch COMP tokens accumulate as you power the AI revolution",
      color: "from-green-500 to-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Particle Background */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center neon-border">
                <Cpu className="text-primary w-5 h-5" />
              </div>
              <span className="text-2xl font-bold neon-text text-primary">WE1WEB</span>
            </div>
            
            <Button 
              className="neon-border bg-primary/10 hover:bg-primary/20 text-primary"
              onClick={() => window.location.href = "/auth"}
            >
              Initialize Session
            </Button>
          </div>
        </div>
      </nav>

      {/* Replace old hero with new Hero Section */}
      <HeroSection />
      
      {/* Keep the existing Earth globe section but update positioning */}
      <section className="relative py-20 bg-gradient-to-b from-background via-background/95 to-background/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Key Benefits */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  <span className="text-white">The Network That</span><br />
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Pays You to Sleep
                  </span>
                </h2>
                <p className="text-lg text-gray-300">
                  Your devices work while you rest. Join millions earning passive income 
                  by contributing idle computing power to democratize AI.
                </p>
              </motion.div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-6 text-lg shadow-lg"
                  onClick={() => window.location.href = "/auth"}
                >
                  <Rocket className="mr-2 w-5 h-5" />
                  Start Earning
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
                  onClick={() => window.location.href = "/provider"}
                >
                  <Brain className="mr-2 w-6 h-6" />
                  Submit AI Tasks
                </Button>
              </div>

              {/* Real-time Network Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="futuristic-card p-4 rounded-xl backdrop-blur-sm">
                    <div className="text-center">
                      <div className={`text-2xl md:text-3xl font-bold ${stat.color} neon-text`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - 3D Earth */}
            <div className="relative">
              <div className="aspect-square max-w-lg mx-auto" style={{ background: 'transparent' }}>
                <EarthGlobe className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 neon-text text-primary">Why Choose WE1WEB?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Experience the next generation of distributed computing with advanced features designed for maximum efficiency and earnings</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="futuristic-card p-6 rounded-2xl text-center group hover:scale-105 transition-transform duration-300">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-r ${feature.color.replace('text-', 'from-')} to-transparent`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4 text-white">Neural Network Deployment</h3>
            <p className="text-xl text-gray-300">Three-step quantum initialization process</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="futuristic-card p-8 rounded-2xl text-center group-hover:scale-105 transition-transform duration-300">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 neon-border`}>
                    <step.icon className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>

          {/* Mission Statement Section */}
          <div className="mb-20">
            <MissionStatement />
          </div>

          {/* Network Growth Projections */}
          <div className="mb-20">
            <NetworkProjections />
          </div>

          {/* NEW: Compute Network CTA */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="futuristic-card p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/30"
            >
              <div className="text-center space-y-6">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-1">
                  🔥 NEW: Functional Network Ready
                </Badge>
                <h3 className="text-3xl font-bold text-white">Try the Live Compute Network Now!</h3>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Connect your devices, join processing pools, and start generating valuable AI training data. 
                  Vote on tasks, monitor earnings in real-time, and sync multiple devices seamlessly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-6 text-lg shadow-lg"
                    onClick={() => window.location.href = "/compute-network"}
                  >
                    <Activity className="mr-2 w-5 h-5" />
                    Launch Compute Network
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
                    onClick={() => window.location.href = "/auth"}
                  >
                    <Users className="mr-2 w-5 h-5" />
                    Join a Pool
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="futuristic-card p-12 rounded-3xl max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-6 text-white">Ready to Join the AI Revolution?</h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Deploy your compute node today and start earning rewards while contributing to groundbreaking AI research
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-black px-8 py-4 text-lg neon-border holographic"
                  onClick={() => window.location.href = "/auth"}
                >
                  <Rocket className="mr-2 w-5 h-5" />
                  Initialize Node
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg neon-border"
                  onClick={() => window.location.href = "/auth"}
                >
                  <Brain className="mr-2 w-5 h-5" />
                  Deploy AI Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-primary/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center neon-border">
                <Cpu className="text-primary w-4 h-4" />
              </div>
              <span className="text-xl font-bold neon-text text-primary">WE1WEB</span>
            </div>
            <p className="text-gray-400 mb-4">Powering the future of distributed AI computing</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span>© 2025 WE1WEB Network</span>
              <span>•</span>
              <span>Decentralized AI Infrastructure</span>
              <span>•</span>
              <span>Phase 1: Foundation Complete</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
