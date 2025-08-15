import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { DonationForm } from "@/components/stripe/donation-form";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Leaf, 
  Globe, 
  Zap, 
  Users, 
  TrendingDown, 
  Target,
  CheckCircle,
  DollarSign,
  Cpu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

export default function Donate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest('POST', '/api/create-donation-intent', {
        amount: amount * 100 // Convert to cents
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowPaymentForm(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Payment setup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const donationAmounts = [5, 10, 25, 50, 100];

  // Mock impact statistics
  const impactStats = {
    totalDonated: 12450,
    carbonReduced: 8.7, // tons of CO2
    computeHoursOptimized: 45600,
    participatingUsers: 1247,
    goalAmount: 50000,
  };

  const progressPercentage = (impactStats.totalDonated / impactStats.goalAmount) * 100;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Reduce AI Carbon Emissions
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Help us optimize existing compute resources to reduce the environmental impact of AI training. 
            Every donation helps power our mission to create a more sustainable AI future.
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="modern-card text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-3">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                ${impactStats.totalDonated.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Donated</p>
            </CardContent>
          </Card>

          <Card className="modern-card text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-3">
                <TrendingDown className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {impactStats.carbonReduced} tons
              </div>
              <p className="text-sm text-muted-foreground">CO₂ Reduced</p>
            </CardContent>
          </Card>

          <Card className="modern-card text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-3">
                <Cpu className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {impactStats.computeHoursOptimized.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Compute Hours Optimized</p>
            </CardContent>
          </Card>

          <Card className="modern-card text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {impactStats.participatingUsers.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Contributors</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Towards Goal */}
        <Card className="modern-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Our 2025 Goal: Carbon-Neutral AI Training
            </CardTitle>
            <CardDescription>
              We're working towards offsetting 100 tons of CO₂ emissions through optimized compute resource sharing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress: ${impactStats.totalDonated.toLocaleString()}</span>
                <span>Goal: ${impactStats.goalAmount.toLocaleString()}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% complete • {impactStats.goalAmount - impactStats.totalDonated} COMP tokens needed to reach our goal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Donation Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Make a Donation
              </CardTitle>
              <CardDescription>
                Donate COMP tokens to support carbon emission reduction initiatives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Choose donation amount (COMP tokens)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {donationAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => setSelectedAmount(amount)}
                      className="h-12"
                    >
                      {amount} COMP
                    </Button>
                  ))}
                </div>
              </div>

              {/* Impact Preview */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Your Impact:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Offset ~{(selectedAmount * 0.02).toFixed(2)} kg of CO₂ emissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Support {selectedAmount * 10} hours of optimized compute sharing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Help fund renewable energy compute initiatives</span>
                  </div>
                </div>
              </div>

              {/* Donate Button */}
              <Button
                onClick={() => createPaymentIntentMutation.mutate(selectedAmount)}
                disabled={createPaymentIntentMutation.isPending}
                className="w-full h-12 text-lg"
              >
                {createPaymentIntentMutation.isPending ? (
                  "Setting up payment..."
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Donate ${selectedAmount}
                  </>
                )}
              </Button>

              {/* Stripe Payment Form */}
              {showPaymentForm && clientSecret && (
                <div className="mt-6">
                  <Elements 
                    stripe={stripePromise} 
                    options={{ 
                      clientSecret,
                      appearance: {
                        theme: 'night',
                        variables: {
                          colorPrimary: '#4ECDC4',
                        }
                      }
                    }}
                  >
                    <DonationForm 
                      amount={selectedAmount}
                      onSuccess={() => {
                        setShowPaymentForm(false);
                        setClientSecret(null);
                        queryClient.invalidateQueries({ queryKey: ["/api/tokens/balance"] });
                      }}
                    />
                  </Elements>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Donations are used exclusively for carbon reduction initiatives and platform sustainability.
              </p>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                How Your Donation Helps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Optimize Existing Resources</h4>
                    <p className="text-sm text-muted-foreground">
                      Fund algorithms that better distribute AI workloads across idle compute resources, 
                      reducing the need for new data centers.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Renewable Energy Incentives</h4>
                    <p className="text-sm text-muted-foreground">
                      Provide bonuses to compute providers who use renewable energy sources, 
                      encouraging the transition to cleaner power.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Carbon Offset Projects</h4>
                    <p className="text-sm text-muted-foreground">
                      Support verified carbon offset projects and invest in technologies that 
                      capture and store carbon from the atmosphere.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Community Education</h4>
                    <p className="text-sm text-muted-foreground">
                      Fund educational programs about sustainable AI practices and help developers 
                      build more energy-efficient models.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-foreground mb-3">Transparency Promise</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• 100% of donations go directly to carbon reduction initiatives</p>
                  <p>• Monthly impact reports published publicly</p>
                  <p>• Verified carbon offset purchases and documentation</p>
                  <p>• Community voting on fund allocation priorities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Donors */}
        <Card className="modern-card mt-12">
          <CardHeader>
            <CardTitle>Recent Contributors</CardTitle>
            <CardDescription>Thank you to our community members making a difference</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Alex M.", amount: 25, impact: "0.5 kg CO₂ offset" },
                { name: "Sarah K.", amount: 50, impact: "1.0 kg CO₂ offset" },
                { name: "DevTeam2024", amount: 100, impact: "2.0 kg CO₂ offset" },
              ].map((donor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{donor.name}</p>
                    <p className="text-sm text-muted-foreground">{donor.impact}</p>
                  </div>
                  <Badge variant="secondary">{donor.amount} COMP</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}