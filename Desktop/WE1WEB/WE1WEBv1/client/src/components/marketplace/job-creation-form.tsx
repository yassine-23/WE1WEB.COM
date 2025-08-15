import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertMarketplaceJobSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Rocket, Upload, DollarSign, Clock, Server, Cpu, 
  HardDrive, Zap, Info, AlertCircle, Brain
} from "lucide-react";
import { z } from "zod";

interface JobCreationFormProps {
  onSuccess?: () => void;
}

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.enum(["training", "inference", "preprocessing", "data-labeling"]),
  modelType: z.string().optional(),
  framework: z.string().optional(),
  requirements: z.object({
    gpuType: z.string(),
    minGpuMemory: z.number(),
    minCpuCores: z.number(),
    minRamGb: z.number(),
    minBandwidthMbps: z.number().optional(),
  }),
  resourceSpecs: z.object({
    datasetSize: z.string(),
    outputFormat: z.string().optional(),
    specialRequirements: z.string().optional(),
  }),
  estimatedDuration: z.number().min(1),
  budget: z.number().min(10),
  minimumNodes: z.number().min(1).max(100),
  maximumNodes: z.number().min(1).max(1000),
  priority: z.number().min(1).max(10),
  autoMatchEnabled: z.boolean(),
  tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

const categories = [
  { value: "training", label: "Model Training", icon: Brain, description: "Train AI models from scratch or fine-tune existing ones" },
  { value: "inference", label: "Inference", icon: Cpu, description: "Run predictions on trained models" },
  { value: "preprocessing", label: "Data Processing", icon: HardDrive, description: "Clean, transform, or prepare datasets" },
  { value: "data-labeling", label: "Data Labeling", icon: Upload, description: "Annotate or label training data" },
];

const gpuTypes = [
  { value: "any", label: "Any GPU", minMemory: 4 },
  { value: "rtx3060", label: "RTX 3060 (12GB)", minMemory: 12 },
  { value: "rtx3070", label: "RTX 3070 (8GB)", minMemory: 8 },
  { value: "rtx3080", label: "RTX 3080 (10GB)", minMemory: 10 },
  { value: "rtx3090", label: "RTX 3090 (24GB)", minMemory: 24 },
  { value: "rtx4090", label: "RTX 4090 (24GB)", minMemory: 24 },
  { value: "a100", label: "A100 (40GB)", minMemory: 40 },
  { value: "v100", label: "V100 (32GB)", minMemory: 32 },
];

const frameworks = [
  { value: "pytorch", label: "PyTorch" },
  { value: "tensorflow", label: "TensorFlow" },
  { value: "jax", label: "JAX" },
  { value: "custom", label: "Custom/Other" },
];

export default function JobCreationForm({ onSuccess }: JobCreationFormProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "training",
      framework: "pytorch",
      requirements: {
        gpuType: "any",
        minGpuMemory: 8,
        minCpuCores: 4,
        minRamGb: 16,
        minBandwidthMbps: 100,
      },
      resourceSpecs: {
        datasetSize: "medium",
      },
      estimatedDuration: 24,
      budget: 500,
      minimumNodes: 1,
      maximumNodes: 5,
      priority: 5,
      autoMatchEnabled: true,
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/marketplace/jobs", {
        ...data,
        tags,
      });
    },
    onSuccess: () => {
      toast({
        title: "Job Posted Successfully",
        description: "Your AI job has been listed on the marketplace",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/jobs"] });
      form.reset();
      setTags([]);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const estimatePrice = () => {
    const gpu = gpuTypes.find(g => g.value === form.watch("requirements.gpuType"));
    const baseRate = gpu?.value === "a100" ? 7.8 : gpu?.value === "v100" ? 6.2 : 3.6;
    const nodes = form.watch("minimumNodes");
    const hours = form.watch("estimatedDuration");
    const priority = form.watch("priority");
    
    let price = baseRate * nodes * hours;
    if (priority > 5) {
      price *= 1 + (priority - 5) * 0.1;
    }
    
    return price.toFixed(2);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6 bg-background/50 border-primary/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Info className="mr-2 w-5 h-5 text-primary" />
            Basic Information
          </h3>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Fine-tune GPT-3 for Customer Support" 
                      className="bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A clear, descriptive title helps providers understand your needs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4}
                      placeholder="Describe your AI task in detail..."
                      className="bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include dataset details, expected outcomes, and any special requirements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div>
                            <div className="flex items-center">
                              <cat.icon className="w-4 h-4 mr-2" />
                              {cat.label}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="modelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Type (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., BERT, GPT-3, ResNet"
                        className="bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="framework"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Framework</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frameworks.map((fw) => (
                          <SelectItem key={fw.value} value={fw.value}>
                            {fw.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Hardware Requirements */}
        <Card className="p-6 bg-background/50 border-secondary/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Server className="mr-2 w-5 h-5 text-secondary" />
            Hardware Requirements
          </h3>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="requirements.gpuType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPU Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requirements.minCpuCores"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum CPU Cores</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={1}
                          max={64}
                          step={1}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-400">
                          {field.value} cores
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements.minRamGb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum RAM (GB)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={8}
                          max={256}
                          step={8}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-400">
                          {field.value} GB
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minimumNodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Nodes</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        className="bg-background/50"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumNodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Nodes</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        className="bg-background/50"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Budget & Timeline */}
        <Card className="p-6 bg-background/50 border-accent/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="mr-2 w-5 h-5 text-accent" />
            Budget & Timeline
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="10"
                        className="bg-background/50"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (hours)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        className="bg-background/50"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority Level</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(v) => field.onChange(v[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Low</span>
                        <span className="text-center">Priority: {field.value}</span>
                        <span>High</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Higher priority jobs get matched faster but cost more
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Estimated Cost</p>
                  <p className="text-2xl font-bold text-primary">${estimatePrice()}</p>
                </div>
                <Zap className="w-8 h-8 text-primary opacity-50" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on {form.watch("minimumNodes")} nodes for {form.watch("estimatedDuration")} hours
              </p>
            </div>
          </div>
        </Card>

        {/* Tags & Settings */}
        <Card className="p-6 bg-background/50 border-purple-500/20">
          <h3 className="text-lg font-semibold mb-4">Tags & Settings</h3>

          <div className="space-y-4">
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  className="bg-background/50"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="autoMatchEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Auto-Match Providers</FormLabel>
                    <FormDescription>
                      Automatically match with qualified providers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={createJobMutation.isPending}
            className="bg-primary hover:bg-primary/80"
          >
            {createJobMutation.isPending ? (
              "Posting..."
            ) : (
              <>
                <Rocket className="mr-2 w-4 h-4" />
                Post Job
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}