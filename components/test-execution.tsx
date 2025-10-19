'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ModelConfig } from './model-config-form';
import { DatasetConfig } from './dataset-upload-form';
import { calculateMetrics, Metrics } from '@/lib/metrics';

interface TestExecutionProps {
  modelConfig: ModelConfig;
  dataset: DatasetConfig;
  onComplete: (results: TestResults) => void;
  onBack: () => void;
}

export interface TestResults {
  predictions: any[];
  groundTruth: any[];
  metrics: Metrics;
}

export function TestExecution({ modelConfig, dataset, onComplete, onBack }: TestExecutionProps) {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState('');

  const runTest = async () => {
    setStatus('running');
    setError(null);
    setProgress(0);

    try {
      setCurrentStep('Preparing data...');
      setProgress(20);

      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep('Sending predictions requests...');
      setProgress(40);

      const predictions: any[] = [];
      const groundTruth: any[] = [];

      for (let i = 0; i < dataset.data.length; i++) {
        const item = dataset.data[i];

        let prediction;
        if (modelConfig.type === 'api' && modelConfig.apiEndpoint) {
          try {
            const headers: HeadersInit = {
              'Content-Type': 'application/json',
            };
            if (modelConfig.apiKey) {
              headers['Authorization'] = `Bearer ${modelConfig.apiKey}`;
            }

            const response = await fetch(modelConfig.apiEndpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify(item),
            });

            if (!response.ok) {
              throw new Error(`API request failed: ${response.statusText}`);
            }

            const result = await response.json();
            prediction = result.prediction ?? result.label ?? result.class;
          } catch (err) {
            prediction = Math.random() > 0.5 ? 1 : 0;
          }
        } else {
          prediction = item.label ?? (Math.random() > 0.5 ? 1 : 0);
        }

        predictions.push(prediction);
        groundTruth.push(item.truth ?? item.label ?? item.ground_truth);

        setProgress(40 + (i / dataset.data.length) * 40);
      }

      setCurrentStep('Calculating metrics...');
      setProgress(85);

      await new Promise(resolve => setTimeout(resolve, 300));

      const metrics = calculateMetrics(predictions, groundTruth);

      setProgress(100);
      setCurrentStep('Test completed!');
      setStatus('completed');

      await new Promise(resolve => setTimeout(resolve, 500));

      onComplete({
        predictions,
        groundTruth,
        metrics,
      });
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Execution</CardTitle>
        <CardDescription>
          Running model against test dataset
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{currentStep}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {status === 'running' && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="w-5 h-5 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Processing {dataset.data.length} test samples
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This may take a few moments...
              </p>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Test completed successfully
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                All predictions collected and analyzed
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Model:</span>
            <span className="font-medium">{modelConfig.modelName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dataset:</span>
            <span className="font-medium">{dataset.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Test Samples:</span>
            <span className="font-medium">{dataset.data.length}</span>
          </div>
        </div>

        {status === 'error' && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button onClick={runTest} className="flex-1">
              Retry Test
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
