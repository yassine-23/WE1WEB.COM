import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import { Brain, Shield, Zap, Globe, Users, Cpu, DollarSign, Activity, Rocket, ChevronRight, Menu, X } from "lucide-react";
import { Link } from "wouter";

export default function LandingNew() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Neural network animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 3 + 1;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#4299e1';
        ctx.fill();
      }
    }
    
    const nodes: Node[] = [];
    for (let i = 0; i < 50; i++) {
      nodes.push(new Node(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ));
    }
    
    function drawConnections() {
      if (!ctx) return;
      ctx.strokeStyle = 'rgba(66, 153, 225, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    let animationId: number;
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawConnections();
      
      nodes.forEach(node => {
        node.update();
        node.draw();
      });
      
      animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { number: "8.5B", label: "Mobile Devices Worldwide", color: "text-cyan-400" },
    { number: "500 EFLOPS", label: "Combined Processing Power", color: "text-purple-400" },
    { number: "€12B", label: "Data Center Equivalent Value", color: "text-green-400" },
    { number: "0 tons", label: "Additional CO2 Emissions", color: "text-blue-400" },
  ];

  const features = [
    {
      icon: Brain,
      title: "Living Neural Network",
      description: "Every device becomes a neuron in a global brain. Process AI workloads, train models, and run inference across millions of connected devices in real-time.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "AI Alignment by Design",
      description: "Distributed control means no single entity can monopolize AI. Humanity collectively owns and governs the intelligence, ensuring alignment with human values.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: DollarSign,
      title: "Universal Basic Compute",
      description: "Transform idle device time into income. Every citizen earns from their contribution to the network, creating a sustainable alternative to traditional UBI.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Zero New Hardware",
      description: "Leverage existing devices instead of building energy-hungry data centers. Save billions in infrastructure costs while achieving carbon-negative AI operations.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Edge AI Processing",
      description: "Run LLMs and AI agents directly on the edge. Sub-100ms latency, infinite scalability, and complete data sovereignty for enterprises and individuals.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Breaking Big Tech Monopoly",
      description: "No more gatekeepers. Deploy AI applications directly to devices, bypassing app stores and cloud providers. True computational democracy.",
      gradient: "from-indigo-500 to-purple-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">W1</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                WE1WEB
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#vision" className="text-gray-300 hover:text-white transition-colors">Vision</a>
              <a href="#stats" className="text-gray-300 hover:text-white transition-colors">Network</a>
              <a href="#developers" className="text-gray-300 hover:text-white transition-colors">Developers</a>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                  Join Network
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800"
          >
            <div className="px-4 py-4 space-y-2">
              <a href="#features" className="block py-2 text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#vision" className="block py-2 text-gray-300 hover:text-white transition-colors">Vision</a>
              <a href="#stats" className="block py-2 text-gray-300 hover:text-white transition-colors">Network</a>
              <a href="#developers" className="block py-2 text-gray-300 hover:text-white transition-colors">Developers</a>
              <Link href="/auth">
                <Button className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                  Join Network
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 mb-8">
              <span className="text-cyan-400 text-sm font-semibold">🌍 Building Humanity's AI Infrastructure</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                The World's Largest
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Decentralized Living Neural Network
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-400 mb-8">
              Powered by Personal Devices. Owned by Humanity.
            </p>

            {/* Description */}
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
              WE1WEB transforms billions of personal devices into a collective superintelligence. 
              We're building the infrastructure where humanity controls AI, not the other way around. 
              Every phone becomes a neuron. Every user becomes a stakeholder. Together, we solve AI alignment 
              by becoming its distributed consciousness.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg">
                  Start Contributing Compute
                  <ChevronRight className="ml-2" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg"
              >
                Explore the Network
              </Button>
            </div>
          </motion.div>

          {/* Neural Network Visualization */}
          <motion.div
            style={{ opacity }}
            className="relative h-96 mt-20"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50"
              >
                <Brain className="w-16 h-16 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Redefining AI Infrastructure for the Agent Era
            </h2>
            <p className="text-xl text-gray-400">
              Built for LLMs, AI Agents, and the future of distributed intelligence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700 p-6 h-full hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              The Untapped Potential
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`text-5xl sm:text-6xl font-bold mb-2 ${stat.color}`}>
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              A New Era of Human-AI Coexistence
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              WE1WEB isn't just infrastructure—it's humanity's answer to the AI revolution. 
              By distributing intelligence across billions of devices, we ensure AI remains 
              a tool for human flourishing, not domination.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6">
                <h4 className="text-lg font-semibold mb-2 text-cyan-400">Democratic Governance</h4>
                <p className="text-gray-400 text-sm">Every contributor has a voice in network decisions</p>
              </Card>
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6">
                <h4 className="text-lg font-semibold mb-2 text-blue-400">Open Source Core</h4>
                <p className="text-gray-400 text-sm">Transparent, auditable, and community-driven development</p>
              </Card>
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6">
                <h4 className="text-lg font-semibold mb-2 text-purple-400">Global Resilience</h4>
                <p className="text-gray-400 text-sm">No single point of failure, unstoppable by design</p>
              </Card>
            </div>

            <Button className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-6 text-lg">
              Read the Whitepaper
              <ChevronRight className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center space-x-6 mb-6">
              <a href="#developers" className="text-gray-400 hover:text-white transition-colors">Developers</a>
              <a href="#docs" className="text-gray-400 hover:text-white transition-colors">Documentation</a>
              <a href="#community" className="text-gray-400 hover:text-white transition-colors">Community</a>
              <a href="#blog" className="text-gray-400 hover:text-white transition-colors">Blog</a>
              <a href="#careers" className="text-gray-400 hover:text-white transition-colors">Careers</a>
              <a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-gray-500">© 2025 WE1WEB. Building the future of decentralized intelligence.</p>
            <p className="text-gray-600 text-sm mt-2">Empowering humanity to own its computational future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}