import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, Cpu, HardDrive, Wifi, Coins, Shield, CheckCircle, Zap } from "lucide-react";

const neuralPoolCreationSchema = z.object({
  name: z.string().min(3, "Pool name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["computer-vision", "nlp", "multimodal", "research", "enterprise"]),
  poolType: z.enum(["public", "private", "invite-only"]),
  minimumRequirements: z.object({
    ram: z.number().min(2, "Minimum 2GB RAM required"),
    vram: z.number().min(2, "Minimum 2GB VRAM required"),
    cpuCores: z.number().min(2, "Minimum 2 CPU cores required"),
    networkSpeed: z.number().min(10, "Minimum 10 Mbps network speed required"),
  }),
  revenueSharing: z.object({
    adminShare: z.number().min(0).max(25, "Admin share cannot exceed 25%"),
    participantShare: z.number().min(70).max(100),
    bonusPool: z.number().min(0).max(10),
  }),
  poolCapacity: z.number().min(2).max(1000),
});

type NeuralPoolCreationData = z.infer<typeof neuralPoolCreationSchema>;

interface NeuralPoolCreationFormProps {
  onSuccess?: (poolId: string) => void;
  onCancel?: () => void;
}

export default function NeuralPoolCreationForm({ onSuccess, onCancel }: NeuralPoolCreationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<NeuralPoolCreationData>({
    resolver: zodResolver(neuralPoolCreationSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "computer-vision",
      poolType: "public",
      minimumRequirements: {
        ram: 2,
        vram: 2,
        cpuCores: 2,
        networkSpeed: 10,
      },
      revenueSharing: {
        adminShare: 10,
        participantShare: 85,
        bonusPool: 5,
      },
      poolCapacity: 50,
    },
  });

  const createPoolMutation = useMutation({
    mutationFn: async (data: NeuralPoolCreationData) => {
      return await apiRequest("/api/neural-pools", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Neural Pool Created",
        description: "Your neural pool has been successfully created and is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/neural-pools"] });
      onSuccess?.(result.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NeuralPoolCreationData) => {
    createPoolMutation.mutate(data);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-cyan-300">Pool Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Neural Vision Research Pool"
                  className="bg-slate-800/50 border-cyan-400/30 text-white placeholder:text-gray-400"
                />
                {form.formState.errors.name && (
                  <p className="text-red-400 text-sm">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-cyan-300">Category</Label>
                <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value as any)}>
                  <SelectTrigger className="bg-slate-800/50 border-cyan-400/30 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-vision">Computer Vision</SelectItem>
                    <SelectItem value="nlp">Natural Language Processing</SelectItem>
                    <SelectItem value="multimodal">Multimodal AI</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-cyan-300">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Describe your neural pool's purpose and objectives..."
                className="bg-slate-800/50 border-cyan-400/30 text-white placeholder:text-gray-400 min-h-[100px]"
              />
              {form.formState.errors.description && (
                <p className="text-red-400 text-sm">{form.formState.errors.description.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="poolType" className="text-cyan-300">Pool Type</Label>
              <Select value={form.watch("poolType")} onValueChange={(value) => form.setValue("poolType", value as any)}>
                <SelectTrigger className="bg-slate-800/50 border-cyan-400/30 text-white">
                  <SelectValue placeholder="Select pool type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can join</SelectItem>
                  <SelectItem value="private">Private - Admin approval required</SelectItem>
                  <SelectItem value="invite-only">Invite Only - Invitation required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <HardDrive className="w-5 h-5" />
                  <span>RAM: {form.watch("minimumRequirements.ram")}GB</span>
                </div>
                <Slider
                  value={[form.watch("minimumRequirements.ram")]}
                  onValueChange={(value) => form.setValue("minimumRequirements.ram", value[0])}
                  max={32}
                  min={2}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Cpu className="w-5 h-5" />
                  <span>VRAM: {form.watch("minimumRequirements.vram")}GB</span>
                </div>
                <Slider
                  value={[form.watch("minimumRequirements.vram")]}
                  onValueChange={(value) => form.setValue("minimumRequirements.vram", value[0])}
                  max={24}
                  min={2}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Zap className="w-5 h-5" />
                  <span>CPU Cores: {form.watch("minimumRequirements.cpuCores")}</span>
                </div>
                <Slider
                  value={[form.watch("minimumRequirements.cpuCores")]}
                  onValueChange={(value) => form.setValue("minimumRequirements.cpuCores", value[0])}
                  max={32}
                  min={2}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Wifi className="w-5 h-5" />
                  <span>Network: {form.watch("minimumRequirements.networkSpeed")} Mbps</span>
                </div>
                <Slider
                  value={[form.watch("minimumRequirements.networkSpeed")]}
                  onValueChange={(value) => form.setValue("minimumRequirements.networkSpeed", value[0])}
                  max={1000}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <Users className="w-5 h-5" />
                <span>Pool Capacity: {form.watch("poolCapacity")} devices</span>
              </div>
              <Slider
                value={[form.watch("poolCapacity")]}
                onValueChange={(value) => form.setValue("poolCapacity", value[0])}
                max={1000}
                min={2}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Shield className="w-5 h-5" />
                  <span>Admin Share: {form.watch("revenueSharing.adminShare")}%</span>
                </div>
                <Slider
                  value={[form.watch("revenueSharing.adminShare")]}
                  onValueChange={(value) => {
                    const adminShare = value[0];
                    const remaining = 100 - adminShare;
                    form.setValue("revenueSharing.adminShare", adminShare);
                    form.setValue("revenueSharing.participantShare", Math.max(70, remaining - form.watch("revenueSharing.bonusPool")));
                  }}
                  max={25}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Coins className="w-5 h-5" />
                  <span>Participant Share: {form.watch("revenueSharing.participantShare")}%</span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-cyan-400/30">
                  <p className="text-gray-300 text-sm">Automatically calculated based on admin and bonus shares</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle className="w-5 h-5" />
                  <span>Bonus Pool: {form.watch("revenueSharing.bonusPool")}%</span>
                </div>
                <Slider
                  value={[form.watch("revenueSharing.bonusPool")]}
                  onValueChange={(value) => {
                    const bonusPool = value[0];
                    form.setValue("revenueSharing.bonusPool", bonusPool);
                    const remaining = 100 - form.watch("revenueSharing.adminShare") - bonusPool;
                    form.setValue("revenueSharing.participantShare", Math.max(70, remaining));
                  }}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="bg-slate-800/30 p-4 rounded-lg border border-cyan-400/20">
              <h4 className="text-cyan-300 font-medium mb-3">Revenue Distribution Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Admin (Pool Management):</span>
                  <span className="text-cyan-400">{form.watch("revenueSharing.adminShare")}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Participants (Contributors):</span>
                  <span className="text-cyan-400">{form.watch("revenueSharing.participantShare")}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Community Bonus Pool:</span>
                  <span className="text-cyan-400">{form.watch("revenueSharing.bonusPool")}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="futuristic-card bg-slate-900/95 border-cyan-400/30 p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Create Neural Pool</h2>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === currentStep
                    ? "bg-cyan-400 border-cyan-400 text-slate-900"
                    : step < currentStep
                    ? "bg-cyan-400/20 border-cyan-400 text-cyan-400"
                    : "bg-slate-700 border-slate-600 text-gray-400"
                }`}
              >
                {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-4 mt-2 text-sm">
            <span className={currentStep === 1 ? "text-cyan-400" : "text-gray-400"}>Basic Info</span>
            <span className={currentStep === 2 ? "text-cyan-400" : "text-gray-400"}>Requirements</span>
            <span className={currentStep === 3 ? "text-cyan-400" : "text-gray-400"}>Revenue</span>
          </div>
        </div>

        {renderStepContent()}

        <div className="flex justify-between pt-6">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
              >
                Previous
              </Button>
            )}
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-red-400/30 text-red-400 hover:bg-red-400/10"
              >
                Cancel
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createPoolMutation.isPending}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
              >
                {createPoolMutation.isPending ? "Creating..." : "Create Pool"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}