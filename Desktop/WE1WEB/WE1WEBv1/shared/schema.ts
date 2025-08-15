import { z } from 'zod';

export const insertTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  reward: z.number().min(0),
  requirements: z.object({
    minCpu: z.number().optional(),
    minMemory: z.number().optional(),
    minBandwidth: z.number().optional(),
    gpuRequired: z.boolean().optional()
  }).optional()
});

export const insertNodeSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['desktop', 'laptop', 'mobile', 'server']),
  cpuCores: z.number().min(1),
  cpuSpeed: z.number().min(0),
  memoryTotal: z.number().min(1),
  memoryAvailable: z.number().min(0),
  gpuModel: z.string().optional(),
  gpuMemory: z.number().optional(),
  bandwidth: z.number().min(0),
  availability: z.array(z.object({
    start: z.string(),
    end: z.string()
  })).optional()
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertNode = z.infer<typeof insertNodeSchema>;
