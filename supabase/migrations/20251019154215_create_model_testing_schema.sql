/*
  # AI Model Testing Platform Schema

  1. New Tables
    - `test_runs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Name of the test run
      - `model_type` (text) - 'upload' or 'api'
      - `model_config` (jsonb) - Stores API endpoint or model details
      - `dataset_name` (text) - Name of the dataset used
      - `dataset_type` (text) - 'csv', 'json', or 'generated'
      - `status` (text) - 'pending', 'running', 'completed', 'failed'
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
    
    - `test_results`
      - `id` (uuid, primary key)
      - `test_run_id` (uuid, foreign key to test_runs)
      - `predictions` (jsonb) - Array of predictions
      - `ground_truth` (jsonb) - Array of ground truth labels
      - `metrics` (jsonb) - Calculated metrics (accuracy, precision, recall, F1)
      - `confusion_matrix` (jsonb) - Confusion matrix data
      - `created_at` (timestamptz)
    
    - `datasets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `type` (text) - 'csv', 'json', 'generated'
      - `data` (jsonb) - The actual dataset
      - `size` (integer) - Number of records
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only read/write their own test runs, results, and datasets
*/

-- Create test_runs table
CREATE TABLE IF NOT EXISTS test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  model_type text NOT NULL CHECK (model_type IN ('upload', 'api')),
  model_config jsonb NOT NULL DEFAULT '{}',
  dataset_name text NOT NULL,
  dataset_type text NOT NULL CHECK (dataset_type IN ('csv', 'json', 'generated')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id uuid REFERENCES test_runs(id) ON DELETE CASCADE NOT NULL,
  predictions jsonb NOT NULL DEFAULT '[]',
  ground_truth jsonb NOT NULL DEFAULT '[]',
  metrics jsonb NOT NULL DEFAULT '{}',
  confusion_matrix jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('csv', 'json', 'generated')),
  data jsonb NOT NULL DEFAULT '[]',
  size integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_runs
CREATE POLICY "Users can view own test runs"
  ON test_runs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own test runs"
  ON test_runs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test runs"
  ON test_runs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own test runs"
  ON test_runs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for test_results
CREATE POLICY "Users can view own test results"
  ON test_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_runs
      WHERE test_runs.id = test_results.test_run_id
      AND test_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own test results"
  ON test_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_runs
      WHERE test_runs.id = test_results.test_run_id
      AND test_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own test results"
  ON test_results FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_runs
      WHERE test_runs.id = test_results.test_run_id
      AND test_runs.user_id = auth.uid()
    )
  );

-- RLS Policies for datasets
CREATE POLICY "Users can view own datasets"
  ON datasets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own datasets"
  ON datasets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own datasets"
  ON datasets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets"
  ON datasets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_runs_user_id ON test_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_results_test_run_id ON test_results(test_run_id);
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);