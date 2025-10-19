'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, BarChart3, Target, TrendingUp } from 'lucide-react';
import { TestResults } from './test-execution';
import { formatMetrics } from '@/lib/metrics';

interface ResultsDashboardProps {
  results: TestResults;
  modelName: string;
  datasetName: string;
  onNewTest: () => void;
}

export function ResultsDashboard({ results, modelName, datasetName, onNewTest }: ResultsDashboardProps) {
  const { metrics } = results;

  const downloadReport = () => {
    const report = formatMetrics(metrics);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-evaluation-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const data = {
      model: modelName,
      dataset: datasetName,
      timestamp: new Date().toISOString(),
      results: {
        predictions: results.predictions,
        groundTruth: results.groundTruth,
        metrics: metrics,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 dark:text-green-400';
    if (score >= 0.7) return 'text-blue-600 dark:text-blue-400';
    if (score >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Model: {modelName} | Dataset: {datasetName}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Report
              </Button>
              <Button onClick={downloadJSON} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Accuracy</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(metrics.accuracy)}`}>
                {(metrics.accuracy * 100).toFixed(2)}%
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">Precision</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(metrics.precision)}`}>
                {(metrics.precision * 100).toFixed(2)}%
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Recall</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(metrics.recall)}`}>
                {(metrics.recall * 100).toFixed(2)}%
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">F1-Score</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(metrics.f1Score)}`}>
                {(metrics.f1Score * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confusion Matrix</CardTitle>
          <CardDescription>
            Visualization of prediction accuracy across classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted"></th>
                  {metrics.confusionMatrix.map((_, idx) => (
                    <th key={idx} className="border p-2 bg-muted font-semibold">
                      Predicted {idx}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.confusionMatrix.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <th className="border p-2 bg-muted font-semibold">
                      Actual {rowIdx}
                    </th>
                    {row.map((value, colIdx) => {
                      const total = row.reduce((sum, val) => sum + val, 0);
                      const intensity = total > 0 ? value / total : 0;
                      const isCorrect = rowIdx === colIdx;

                      return (
                        <td
                          key={colIdx}
                          className="border p-4 text-center font-semibold"
                          style={{
                            backgroundColor: isCorrect
                              ? `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`
                              : `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`,
                          }}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {metrics.classMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Per-Class Metrics</CardTitle>
            <CardDescription>
              Detailed performance breakdown for each class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.classMetrics).map(([label, classMetric]) => (
                <div key={label} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Class: {label}</h4>
                    <Badge variant="secondary">
                      {classMetric.support} samples
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Precision</p>
                      <p className="text-lg font-semibold">
                        {(classMetric.precision * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Recall</p>
                      <p className="text-lg font-semibold">
                        {(classMetric.recall * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">F1-Score</p>
                      <p className="text-lg font-semibold">
                        {(classMetric.f1Score * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={onNewTest} size="lg">
          Run New Test
        </Button>
      </div>
    </div>
  );
}
