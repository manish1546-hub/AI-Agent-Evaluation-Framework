import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      test_runs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          model_type: 'upload' | 'api';
          model_config: any;
          dataset_name: string;
          dataset_type: 'csv' | 'json' | 'generated';
          status: 'pending' | 'running' | 'completed' | 'failed';
          created_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['test_runs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['test_runs']['Insert']>;
      };
      test_results: {
        Row: {
          id: string;
          test_run_id: string;
          predictions: any[];
          ground_truth: any[];
          metrics: any;
          confusion_matrix: any;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['test_results']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['test_results']['Insert']>;
      };
      datasets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'csv' | 'json' | 'generated';
          data: any[];
          size: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['datasets']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['datasets']['Insert']>;
      };
    };
  };
};
