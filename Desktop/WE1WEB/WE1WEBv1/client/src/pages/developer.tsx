import Navigation from "@/components/navigation";
import JobSubmissionForm from "@/components/forms/job-submission-form";
import DeveloperDashboard from "@/components/dashboard/developer-dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Zap, DollarSign, Activity } from "lucide-react";

export default function Developer() {
  const costComparison = [
    {
      provider: "Traditional Cloud",
      cost: "$2.40",
      color: "text-red-400",
      features: ["+ Setup fees", "+ Data transfer costs", "+ Premium support"]
    },
    {
      provider: "Computara Network", 
      cost: "$0.72",
      color: "text-primary",
      features: ["✓ No setup fees", "✓ Pay per use", "✓ Global coverage"],
      highlight: true
    },
    {
      provider: "Cost Reduction",
      cost: "70%",
      color: "text-green-400", 
      features: ["Save $1,680 per hour", "on 1000 GPU operations", "Scale globally"]
    }
  ];

  const templates = [
    {
      name: "GPT-3.5 Fine-tuning",
      description: "Custom chatbot with your data",
      cost: "$50-200",
      badge: "Popular",
      badgeColor: "bg-primary/10 text-primary"
    },
    {
      name: "ResNet Image Classification", 
      description: "Train on custom image dataset",
      cost: "$15-80",
      badge: "Fast",
      badgeColor: "bg-accent/10 text-accent"
    },
    {
      name: "BERT Sentiment Analysis",
      description: "Text classification and NLP", 
      cost: "$25-120",
      badge: null,
      badgeColor: ""
    },
    {
      name: "Stable Diffusion Fine-tune",
      description: "Custom image generation model",
      cost: "$100-500", 
      badge: "Advanced",
      badgeColor: "bg-secondary/10 text-secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyberpunk-grid opacity-20"></div>
      <div className="absolute inset-0 gradient-hero opacity-30"></div>
      
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-2xl flex items-center justify-center neon-border">
              <Code className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold neon-text text-secondary">AI Developer Neural Hub</h1>
          </div>
          <p className="text-xl text-gray-300">
            Deploy distributed AI training at 70% lower cost through our neural compute network
          </p>
        </div>

        {/* Neural Network Cost Analysis */}
        <div className="futuristic-card p-8 mb-12 rounded-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-8 flex items-center justify-center">
            <DollarSign className="mr-3 w-6 h-6 text-primary" />
            Neural Network Cost Analysis
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {costComparison.map((item, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-xl relative ${
                  item.highlight
                    ? "bg-primary/10 border-2 border-primary neon-border"
                    : "bg-background/50 border border-gray-500/30"
                } scan-line`}
              >
                {item.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-bold neon-border">
                    NEURAL EDGE
                  </div>
                )}
                <div className={`text-lg font-semibold mb-3 ${item.color}`}>
                  {item.provider}
                </div>
                <div className={`text-4xl font-bold mb-3 neon-text ${item.color}`}>
                  {item.cost}
                  {index < 2 && <span className="text-lg text-gray-400"> /GPU·hr</span>}
                  {index === 2 && <span className="text-lg text-gray-400"> savings</span>}
                </div>
                <div className="text-gray-400 mb-4 text-sm">
                  {index < 2 ? "per GPU hour" : "total reduction"}
                </div>
                <div className={`text-sm space-y-1 ${item.highlight ? "text-primary font-medium" : "text-gray-400"}`}>
                  {item.features.map((feature, i) => (
                    <div key={i} className="flex items-center justify-center">
                      <span className="mr-2">
                        {feature.startsWith('✓') ? '⚡' : feature.startsWith('+') ? '⚠️' : '🚀'}
                      </span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Neural Job Deployment */}
          <div className="futuristic-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Zap className="mr-3 w-5 h-5 text-primary" />
              Neural Job Deployment
            </h2>
            <JobSubmissionForm />
          </div>

          {/* AI Model Templates */}
          <div className="futuristic-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Code className="mr-3 w-5 h-5 text-secondary" />
              AI Model Templates
            </h2>
            <div className="space-y-4">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="p-4 bg-background/50 border border-primary/20 rounded-xl hover:border-primary/60 transition-colors cursor-pointer scan-line"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{template.name}</h3>
                      <p className="text-sm text-gray-400">{template.description}</p>
                    </div>
                    {template.badge && (
                      <Badge className={`${template.badgeColor} neon-border text-xs`}>
                        {template.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Neural cost range:</span>
                    <span className="font-medium text-primary">{template.cost}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full mt-6 bg-secondary/20 hover:bg-secondary/30 text-secondary neon-border">
              Browse Neural Templates
            </Button>
          </div>
        </div>

        {/* Neural API Interface */}
        <div className="futuristic-card p-8 mb-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center justify-center">
            <Code className="mr-3 w-6 h-6 text-primary" />
            Neural API Interface
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-secondary mb-4 flex items-center">
                <Zap className="mr-2 w-4 h-4" />
                REST Neural Endpoint
              </h3>
              <div className="bg-black/60 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto border border-primary/30 neon-border scan-line">
                <div className="text-blue-400"># Deploy neural network training</div>
                <div><span className="text-yellow-400">curl</span> -X POST \</div>
                <div className="ml-2">https://neural.computara.ai/v1/deploy \</div>
                <div className="ml-2">-H <span className="text-red-400">"Neural-Key: YOUR_API_KEY"</span> \</div>
                <div className="ml-2">-d <span className="text-red-400">{'\'{"model": "gpt-4", "nodes": 100}\''}</span></div>
                <div className="text-purple-400 mt-2"># Response: job_id, estimated_cost, eta</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary mb-4 flex items-center">
                <Code className="mr-2 w-4 h-4" />
                Python Neural SDK
              </h3>
              <div className="bg-black/60 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto border border-secondary/30 neon-border scan-line">
                <div className="text-blue-400"># pip install computara-neural</div>
                <div><span className="text-yellow-400">from</span> computara <span className="text-yellow-400">import</span> NeuralClient</div>
                <div></div>
                <div>neural = NeuralClient(<span className="text-red-400">'api_key'</span>)</div>
                <div>deployment = neural.deploy(</div>
                <div className="ml-2">model=<span className="text-red-400">'transformer'</span>,</div>
                <div className="ml-2">compute_target=<span className="text-red-400">'gpu_cluster'</span>,</div>
                <div className="ml-2">auto_scale=<span className="text-yellow-400">True</span></div>
                <div>)</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center space-x-4">
            <Button className="bg-primary/20 hover:bg-primary/30 text-primary neon-border">
              Generate Neural Key
            </Button>
            <Button className="bg-background/50 hover:bg-background/70 text-white border border-secondary/30">
              Access Documentation
            </Button>
            <Button className="bg-background/50 hover:bg-background/70 text-white border border-purple-500/30">
              Download SDK
            </Button>
          </div>
        </div>

        {/* Neural Dashboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Activity className="mr-3 w-6 h-6 text-primary" />
            Neural Development Dashboard
          </h2>
          <DeveloperDashboard />
        </div>
      </div>
    </div>
  );
}
