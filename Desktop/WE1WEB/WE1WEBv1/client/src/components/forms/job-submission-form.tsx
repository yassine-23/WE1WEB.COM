import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertTaskSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Upload, DollarSign } from "lucide-react";
import { z } from "zod";

const jobSubmissionSchema = insertTaskSchema.extend({
  name: z.string().min(1, "Project name is required"),
  modelType: z.string().min(1, "Model type is required"),
  requiredNodes: z.number().min(1).max(100),
  maxBudget: z.string().transform((val) => parseFloat(val)).optional(),
  trainingParams: z.string().optional(),
});

type JobSubmissionData = z.infer<typeof jobSubmissionSchema>;

const frameworkOptions = ["pytorch", "tensorflow", "jax"];
const modelTypes = [
  { value: "gpt-3.5", label: "GPT-3.5 Fine-tune", cost: 7.20 },
  { value: "gpt-4", label: "GPT-4 Fine-tune", cost: 12.40 },
  { value: "bert", label: "BERT Training", cost: 4.80 },
  { value: "resnet", label: "ResNet Training", cost: 3.20 },
  { value: "custom", label: "Custom Model", cost: 6.00 },
];

const gpuTypes = [
  { value: "rtx4090", label: "RTX 4090 (24GB)", cost: 7.20 },
  { value: "rtx3090", label: "RTX 3090 (24GB)", cost: 5.80 },
  { value: "a100", label: "A100 (40GB)", cost: 15.60 },
  { value: "v100", label: "V100 (32GB)", cost: 12.40 },
];

export default function JobSubmissionForm() {
  const [selectedFramework, setSelectedFramework] = useState("pytorch");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<JobSubmissionData>({
    resolver: zodResolver(jobSubmissionSchema),
    defaultValues: {
      name: "",
      taskType: "training",
      modelType: "",
      requiredNodes: 4,
      priority: 5,
      requirements: {
        framework: "pytorch",
        gpuType: "rtx4090",
        minGpuMemory: 24,
      },
      trainingParams: "learning_rate: 0.001\nbatch_size: 32\nepochs: 10",
    },
  });

  const submitJobMutation = useMutation({
    mutationFn: async (data: JobSubmissionData) => {
      const formattedData = {
        ...data,
        requirements: {
          ...data.requirements,
          framework: selectedFramework,
        },
        trainingParams: data.trainingParams ? 
          data.trainingParams.split('\n').reduce((acc, line) => {
            const [key, value] = line.split(':').map(s => s.trim());
            if (key && value) acc[key] = value;
            return acc;
          }, {} as Record<string, string>) : {},
      };
      
      return apiRequest("POST", "/api/tasks", formattedData);
    },
    onSuccess: () => {
      toast({
        title: "Job Submitted Successfully",
        description: "Your AI training job has been queued and will start soon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateEstimatedCost = (modelType: string, nodes: number, gpuType: string) => {
    const model = modelTypes.find(m => m.value === modelType);
    const gpu = gpuTypes.find(g => g.value === gpuType);
    if (model && gpu) {
      return (gpu.cost * nodes).toFixed(2);
    }
    return "0.00";
  };

  const handleFormChange = () => {
    const values = form.getValues();
    const cost = calculateEstimatedCost(
      values.modelType,
      values.requiredNodes,
      values.requirements?.gpuType || "rtx4090"
    );
    setEstimatedCost(parseFloat(cost));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => submitJobMutation.mutate(data))} className="space-y-4">
        {/* Framework Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Framework</label>
          <div className="grid grid-cols-3 gap-2">
            {frameworkOptions.map((framework) => (
              <Button
                key={framework}
                type="button"
                variant={selectedFramework === framework ? "default" : "outline"}
                className="capitalize"
                onClick={() => setSelectedFramework(framework)}
              >
                {framework}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Customer Support Chatbot" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFormChange();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Type</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleFormChange();
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {modelTypes.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dataset Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dataset</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="mx-auto w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-600">Upload your training dataset or select from marketplace</p>
            <Button type="button" variant="link" className="mt-2">
              Browse Marketplace
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="requirements.gpuType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required GPU Memory</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleFormChange();
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select GPU type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gpuTypes.map((gpu) => (
                      <SelectItem key={gpu.value} value={gpu.value}>
                        {gpu.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requiredNodes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Nodes</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="100"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value));
                      handleFormChange();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Budget</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="500"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleFormChange();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="trainingParams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Parameters</FormLabel>
              <FormControl>
                <Textarea 
                  rows={4}
                  placeholder="learning_rate: 0.001&#10;batch_size: 32&#10;epochs: 10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cost Estimation */}
        <Card className="p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Estimated Cost</span>
            <span className="text-2xl font-bold text-primary">
              ${estimatedCost}/hour
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{form.watch("requiredNodes")} × {form.watch("modelType")} @ ${estimatedCost/form.watch("requiredNodes")}/hour</span>
            <span className="text-red-600">vs ${(estimatedCost * 3.33).toFixed(2)} on AWS</span>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <Button 
            type="submit" 
            disabled={submitJobMutation.isPending}
            className="flex-1 mr-4"
          >
            {submitJobMutation.isPending ? (
              "Submitting..."
            ) : (
              <>
                <Rocket className="mr-2 w-4 h-4" />
                Launch Training Job
              </>
            )}
          </Button>
          
          <div className="text-sm text-gray-600">
            Est. time: <span className="font-medium">4-6 hours</span>
          </div>
        </div>
      </form>
    </Form>
  );
}
