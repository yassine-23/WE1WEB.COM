import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          profile_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          updated_at?: string;
        };
      };
      nodes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          status: string;
          gpu_info: any | null;
          cpu_info: any | null;
          memory_gb: number | null;
          storage_gb: number | null;
          network_speed: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          status?: string;
          gpu_info?: any | null;
          cpu_info?: any | null;
          memory_gb?: number | null;
          storage_gb?: number | null;
          network_speed?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: string;
          gpu_info?: any | null;
          cpu_info?: any | null;
          memory_gb?: number | null;
          storage_gb?: number | null;
          network_speed?: number | null;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: string;
          progress: number;
          requirements: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: string;
          progress?: number;
          requirements?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: string;
          progress?: number;
          updated_at?: string;
        };
      };
      token_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: string;
          description?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
}