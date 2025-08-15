import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import NodeConfigForm from "@/components/forms/node-config-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Settings, Coins, Cpu, Zap, Shield } from "lucide-react";

export default function Onboarding() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: "Download Client",
      description: "Install our lightweight desktop app",
      icon: Download,
    },
    {
      title: "Configure Node", 
      description: "Set up your hardware preferences",
      icon: Settings,
    },
    {
      title: "Start Earning",
      description: "Begin contributing to AI training",
      icon: Coins,
    }
  ];

  const features = [
    {
      icon: Cpu,
      title: "Automatic Hardware Detection",
      description: "Our client automatically detects your CPU, GPU, and memory specifications"
    },
    {
      icon: Zap,
      title: "Smart Resource Management", 
      description: "Intelligently manages resources to avoid impacting your daily usage"
    },
    {
      icon: Shield,
      title: "Secure Sandboxing",
      description: "All AI training tasks run in isolated containers for maximum security"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyberpunk-grid opacity-20"></div>
      <div className="absolute inset-0 gradient-hero opacity-30"></div>
      
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center neon-border">
              <Zap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold neon-text text-primary">
              Neural Node Initialization
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Configure your neural compute node to join the distributed AI network and earn COMP tokens
          </p>
        </div>

        {/* Neural Initialization Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center space-x-3 ${isActive ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-gray-500'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center neon-border ${
                      isCompleted ? 'bg-secondary/20 text-secondary border-secondary' :
                      isActive ? 'bg-primary/20 text-primary border-primary' : 
                      'bg-background/50 text-gray-500 border-gray-500/30'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="hidden md:block">
                      <div className="font-semibold text-white">{step.title}</div>
                      <div className="text-sm text-gray-400">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      stepNumber < currentStep ? 'bg-secondary' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Download Node Client</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                className="mb-4"
                onClick={() => setCurrentStep(2)}
              >
                <Download className="mr-2 w-5 h-5" />
                Download for {navigator.platform.includes('Win') ? 'Windows' : navigator.platform.includes('Mac') ? 'macOS' : 'Linux'}
              </Button>
              <div className="text-sm text-gray-600">
                Other platforms: 
                <button className="text-primary hover:underline ml-1">Windows</button>
                <span className="mx-1">•</span>
                <button className="text-primary hover:underline">macOS</button>
                <span className="mx-1">•</span>
                <button className="text-primary hover:underline">Linux</button>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Configure Your Node</h2>
            <NodeConfigForm onComplete={() => setCurrentStep(3)} />
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="p-8 mb-8 text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-4">You're All Set!</h2>
            <p className="text-gray-600 mb-6">
              Your node is now configured and ready to start earning. You'll begin receiving AI training tasks based on your hardware capabilities and availability settings.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-lg font-semibold text-accent">~$15-50</div>
                <div className="text-sm text-gray-600">Estimated daily earnings</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-lg font-semibold text-primary">24/7</div>
                <div className="text-sm text-gray-600">Passive income potential</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-lg font-semibold text-secondary">5 min</div>
                <div className="text-sm text-gray-600">Average task assignment</div>
              </div>
            </div>

            <Button size="lg" onClick={() => window.location.href = "/"}>
              Go to Dashboard
            </Button>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < 3 && (
            <Button
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
