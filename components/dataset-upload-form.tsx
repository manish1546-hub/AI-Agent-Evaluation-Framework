'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileJson, FileSpreadsheet, Sparkles } from 'lucide-react';

interface DatasetUploadFormProps {
  onSubmit: (dataset: DatasetConfig) => void;
  onBack: () => void;
}

export interface DatasetConfig {
  name: string;
  type: 'csv' | 'json' | 'generated';
  data: any[];
  file?: File;
}

export function DatasetUploadForm({ onSubmit, onBack }: DatasetUploadFormProps) {
  const [datasetType, setDatasetType] = useState<'csv' | 'json' | 'generated'>('json');
  const [datasetName, setDatasetName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx];
      });
      return obj;
    });
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (datasetType === 'json' && jsonData) {
        const parsed = JSON.parse(jsonData);
        const data = Array.isArray(parsed) ? parsed : [parsed];
        onSubmit({
          name: datasetName,
          type: 'json',
          data,
        });
      } else if (file) {
        const text = await file.text();

        if (datasetType === 'csv') {
          const data = parseCSV(text);
          onSubmit({
            name: datasetName,
            type: 'csv',
            data,
            file,
          });
        } else if (datasetType === 'json') {
          const data = JSON.parse(text);
          onSubmit({
            name: datasetName,
            type: 'json',
            data: Array.isArray(data) ? data : [data],
            file,
          });
        }
      } else if (datasetType === 'generated') {
        const sampleData = [
          { text: 'This is a positive example', label: 1, truth: 1 },
          { text: 'This is a negative example', label: 0, truth: 0 },
          { text: 'Another positive example', label: 1, truth: 1 },
          { text: 'Another negative example', label: 0, truth: 0 },
        ];

        onSubmit({
          name: datasetName,
          type: 'generated',
          data: sampleData,
        });
      }
    } catch (error) {
      alert('Error processing dataset: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset Configuration</CardTitle>
        <CardDescription>
          Upload or generate a test dataset with features and ground truth labels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFileUpload} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="datasetName">Dataset Name</Label>
            <Input
              id="datasetName"
              placeholder="Test Dataset 1"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Dataset Source</Label>
            <RadioGroup
              value={datasetType}
              onValueChange={(value: 'csv' | 'json' | 'generated') => setDatasetType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                  <FileJson className="w-4 h-4" />
                  JSON Format
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV Format
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="generated" id="generated" />
                <Label htmlFor="generated" className="flex items-center gap-2 cursor-pointer">
                  <Sparkles className="w-4 h-4" />
                  Generate Sample Data
                </Label>
              </div>
            </RadioGroup>
          </div>

          {datasetType === 'csv' && (
            <div className="space-y-2">
              <Label htmlFor="csvFile">CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
              <p className="text-sm text-muted-foreground">
                CSV should include headers and a column for ground truth labels
              </p>
            </div>
          )}

          {datasetType === 'json' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jsonFile">JSON File (optional)</Label>
                <Input
                  id="jsonFile"
                  type="file"
                  accept=".json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jsonData">Or Paste JSON Data</Label>
                <Textarea
                  id="jsonData"
                  placeholder='[{"feature": "value", "truth": 1}, ...]'
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Each object should include a "truth" field with the ground truth label
                </p>
              </div>
            </div>
          )}

          {datasetType === 'generated' && (
            <div className="space-y-2">
              <Label htmlFor="prompt">Dataset Description (optional)</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the type of data you want to generate..."
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Sample data will be generated for testing purposes
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? 'Processing...' : 'Continue to Test'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
