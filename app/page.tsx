'use client';

import { useState } from 'react';
import { ModelConfigForm, ModelConfig } from '@/components/model-config-form';
import { DatasetUploadForm, DatasetConfig } from '@/components/dataset-upload-form';
import { TestExecution, TestResults } from '@/components/test-execution';
import { ResultsDashboard } from '@/components/results-dashboard';
import { FlaskConical, Database, PlayCircle, BarChart } from 'lucide-react';

type Step = 'model' | 'dataset' | 'testing' | 'results';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('model');
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [dataset, setDataset] = useState<DatasetConfig | null>(null);
  const [results, setResults] = useState<TestResults | null>(null);

  const handleModelSubmit = (config: ModelConfig) => {
    setModelConfig(config);
    setCurrentStep('dataset');
  };

  const handleDatasetSubmit = (datasetConfig: DatasetConfig) => {
    setDataset(datasetConfig);
    setCurrentStep('testing');
  };

  const handleTestComplete = (testResults: TestResults) => {
    setResults(testResults);
    setCurrentStep('results');
  };

  const handleNewTest = () => {
    setModelConfig(null);
    setDataset(null);
    setResults(null);
    setCurrentStep('model');
  };

  const steps = [
    { id: 'model', label: 'Model', icon: FlaskConical },
    { id: 'dataset', label: 'Dataset', icon: Database },
    { id: 'testing', label: 'Testing', icon: PlayCircle },
    { id: 'results', label: 'Results', icon: BarChart },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <BarChart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI Model Accuracy Tester
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your model, test it against datasets, and get comprehensive evaluation metrics
          </p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                      isActive
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                        : isCompleted
                        ? 'bg-green-50 dark:bg-green-950 border-green-600 text-green-700 dark:text-green-300'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-8 mx-2 transition-all ${
                        isCompleted ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {currentStep === 'model' && (
            <ModelConfigForm onSubmit={handleModelSubmit} />
          )}

          {currentStep === 'dataset' && modelConfig && (
            <DatasetUploadForm
              onSubmit={handleDatasetSubmit}
              onBack={() => setCurrentStep('model')}
            />
          )}

          {currentStep === 'testing' && modelConfig && dataset && (
            <TestExecution
              modelConfig={modelConfig}
              dataset={dataset}
              onComplete={handleTestComplete}
              onBack={() => setCurrentStep('dataset')}
            />
          )}
        </div>

        {currentStep === 'results' && results && modelConfig && dataset && (
          <ResultsDashboard
            results={results}
            modelName={modelConfig.modelName}
            datasetName={dataset.name}
            onNewTest={handleNewTest}
          />
        )}

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Supports classification models with accuracy, precision, recall, and F1-score metrics
          </p>
        </div>
      </div>
    </div>
  );
}
