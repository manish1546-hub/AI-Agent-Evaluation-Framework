'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Link2 } from 'lucide-react';

interface ModelConfigFormProps {
  onSubmit: (config: ModelConfig) => void;
}

export interface ModelConfig {
  type: 'upload' | 'api';
  apiEndpoint?: string;
  apiKey?: string;
  modelFile?: File;
  modelName: string;
}

export function ModelConfigForm({ onSubmit }: ModelConfigFormProps) {
  const [modelType, setModelType] = useState<'upload' | 'api'>('api');
  const [modelName, setModelName] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: ModelConfig = {
      type: modelType,
      modelName,
    };

    if (modelType === 'api') {
      config.apiEndpoint = apiEndpoint;
      config.apiKey = apiKey;
    } else if (modelFile) {
      config.modelFile = modelFile;
    }

    onSubmit(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Configuration</CardTitle>
        <CardDescription>
          Configure your AI model by uploading a file or connecting to an API endpoint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="modelName">Model Name</Label>
            <Input
              id="modelName"
              placeholder="My Classification Model"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Model Type</Label>
            <RadioGroup value={modelType} onValueChange={(value: 'upload' | 'api') => setModelType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="api" id="api" />
                <Label htmlFor="api" className="flex items-center gap-2 cursor-pointer">
                  <Link2 className="w-4 h-4" />
                  API Endpoint
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload" className="flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload Model File
                </Label>
              </div>
            </RadioGroup>
          </div>

          {modelType === 'api' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiEndpoint">API Endpoint URL</Label>
                <Input
                  id="apiEndpoint"
                  type="url"
                  placeholder="https://api.example.com/predict"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key (optional)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter API key if required"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </div>
          )}

          {modelType === 'upload' && (
            <div className="space-y-2">
              <Label htmlFor="modelFile">Model File</Label>
              <Input
                id="modelFile"
                type="file"
                accept=".pkl,.h5,.pt,.pth,.onnx,.json"
                onChange={(e) => setModelFile(e.target.files?.[0] || null)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: .pkl, .h5, .pt, .pth, .onnx, .json
              </p>
            </div>
          )}

          <Button type="submit" className="w-full">
            Continue to Dataset
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
