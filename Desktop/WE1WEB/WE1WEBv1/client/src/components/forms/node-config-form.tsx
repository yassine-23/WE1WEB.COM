import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertNodeSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Cpu, HardDrive, Wifi, Zap } from "lucide-react";
import { z } from "zod";

const nodeConfigSchema = insertNodeSchema.extend({
  name: z.string().min(1, "Node name is required"),
  cpuCores: z.number().min(1, "CPU cores must be at least 1"),
  ramGb: z.number().min(4, "RAM must be at least 4GB"),
  bandwidthMbps: z.number().min(10, "Bandwidth must be at least 10 Mbps"),
});

type NodeConfigData = z.infer<typeof nodeConfigSchema>;

interface NodeConfigFormProps {
  onComplete?: () => void;
}

export default function NodeConfigForm({ onComplete }: NodeConfigFormProps) {
  const [maxGpuUsage, setMaxGpuUsage] = useState(80);
  const [maxCpuUsage, setMaxCpuUsage] = useState(60);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NodeConfigData>({
    resolver: zodResolver(nodeConfigSchema),
    defaultValues: {
      name: `${navigator.platform}-Node-${Date.now().toString().slice(-4)}`,
      cpuCores: 8,
      cpuModel: "Intel i7-13700K",
      ramGb: 32,
      gpuModel: "RTX 4090",
      gpuVramGb: 24,
      bandwidthMbps: 1000,
      locationCountry: "US",
      locationRegion: "California",
      maxGpuUsage: 80,
      maxCpuUsage: 60,
      allowHighPriority: true,
      pauseDuringGaming: false,
      availabilitySchedule: {
        monday: { start: "20:00", end: "08:00", available: true },
        tuesday: { start: "20:00", end: "08:00", available: true },
        wednesday: { start: "20:00", end: "08:00", available: true },
        thursday: { start: "20:00", end: "08:00", available: true },
        friday: { start: "20:00", end: "08:00", available: true },
        saturday: { start: "00:00", end: "23:59", available: true },
        sunday: { start: "00:00", end: "23:59", available: true },
      },
    },
  });

  const createNodeMutation = useMutation({
    mutationFn: async (data: NodeConfigData) => {
      const nodeData = {
        ...data,
        maxGpuUsage,
        maxCpuUsage,
        hardwareFingerprint: `${data.cpuModel}-${data.gpuModel}-${Date.now()}`,
      };
      return apiRequest("POST", "/api/nodes", nodeData);
    },
    onSuccess: () => {
      toast({
        title: "Node Configured Successfully",
        description: "Your compute node is now ready to receive AI training tasks.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nodes"] });
      onComplete?.();
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
        title: "Configuration Failed",
        description: error.message || "Failed to configure node. Please try again.",
        variant: "destructive",
      });
    },
  });

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      {/* Hardware Detection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Cpu className="mr-2 w-5 h-5" />
          Hardware Detection
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Node Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpuModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPU Model</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpuCores"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPU Cores</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
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
            name="ramGb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RAM (GB)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
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
            name="gpuModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GPU Model</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gpuVramGb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GPU VRAM (GB)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>

      {/* Availability Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Available Hours</h3>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-xs text-gray-600 mb-1">{dayLabels[index]}</div>
              <div className="h-20 bg-primary/20 rounded cursor-pointer hover:bg-primary/30 transition-colors relative">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-primary rounded"
                  style={{ height: day === "friday" ? "60%" : "80%" }}
                  title={`Available ${day === "friday" ? "12h" : "16h"}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-600 mt-2">Blue = Available for tasks</div>
      </Card>

      {/* Resource Limits */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="mr-2 w-5 h-5" />
          Resource Limits
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Max GPU Usage
            </Label>
            <Slider
              value={[maxGpuUsage]}
              onValueChange={(value) => setMaxGpuUsage(value[0])}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0%</span>
              <span className="font-medium">{maxGpuUsage}%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Max CPU Usage
            </Label>
            <Slider
              value={[maxCpuUsage]}
              onValueChange={(value) => setMaxCpuUsage(value[0])}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0%</span>
              <span className="font-medium">{maxCpuUsage}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <FormField
            control={form.control}
            name="allowHighPriority"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm text-gray-700">
                  Allow high-priority tasks
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pauseDuringGaming"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm text-gray-700">
                  Pause during gaming
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </Card>

      {/* Network Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Wifi className="mr-2 w-5 h-5" />
          Network Configuration
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bandwidthMbps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bandwidth (Mbps)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
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
            name="locationRegion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => createNodeMutation.mutate(data))}>
          <Button 
            type="submit" 
            className="w-full"
            disabled={createNodeMutation.isPending}
          >
            {createNodeMutation.isPending ? "Configuring..." : "Save Configuration"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
