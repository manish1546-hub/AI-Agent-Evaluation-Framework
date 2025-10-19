export interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  classMetrics?: {
    [key: string]: {
      precision: number;
      recall: number;
      f1Score: number;
      support: number;
    };
  };
}

export function calculateMetrics(predictions: any[], groundTruth: any[]): Metrics {
  if (predictions.length !== groundTruth.length) {
    throw new Error('Predictions and ground truth must have the same length');
  }

  const labels = Array.from(new Set([...predictions, ...groundTruth])).sort();
  const labelToIndex = new Map(labels.map((label, idx) => [label, idx]));
  const n = labels.length;

  const confusionMatrix = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < predictions.length; i++) {
    const predIdx = labelToIndex.get(predictions[i])!;
    const trueIdx = labelToIndex.get(groundTruth[i])!;
    confusionMatrix[trueIdx][predIdx]++;
  }

  let correctPredictions = 0;
  for (let i = 0; i < n; i++) {
    correctPredictions += confusionMatrix[i][i];
  }
  const accuracy = correctPredictions / predictions.length;

  const classMetrics: Metrics['classMetrics'] = {};
  let weightedPrecision = 0;
  let weightedRecall = 0;
  let weightedF1 = 0;

  for (let i = 0; i < n; i++) {
    const label = labels[i];
    const truePositives = confusionMatrix[i][i];
    const falsePositives = confusionMatrix.reduce((sum, row, idx) =>
      idx !== i ? sum + row[i] : sum, 0
    );
    const falseNegatives = confusionMatrix[i].reduce((sum, val, idx) =>
      idx !== i ? sum + val : sum, 0
    );
    const support = confusionMatrix[i].reduce((sum, val) => sum + val, 0);

    const precision = truePositives + falsePositives > 0
      ? truePositives / (truePositives + falsePositives)
      : 0;
    const recall = truePositives + falseNegatives > 0
      ? truePositives / (truePositives + falseNegatives)
      : 0;
    const f1 = precision + recall > 0
      ? 2 * (precision * recall) / (precision + recall)
      : 0;

    classMetrics[String(label)] = {
      precision,
      recall,
      f1Score: f1,
      support,
    };

    weightedPrecision += precision * support;
    weightedRecall += recall * support;
    weightedF1 += f1 * support;
  }

  const totalSupport = predictions.length;
  const avgPrecision = weightedPrecision / totalSupport;
  const avgRecall = weightedRecall / totalSupport;
  const avgF1 = weightedF1 / totalSupport;

  return {
    accuracy,
    precision: avgPrecision,
    recall: avgRecall,
    f1Score: avgF1,
    confusionMatrix,
    classMetrics,
  };
}

export function formatMetrics(metrics: Metrics): string {
  let report = `Model Evaluation Report\n`;
  report += `========================\n\n`;
  report += `Overall Metrics:\n`;
  report += `  Accuracy:  ${(metrics.accuracy * 100).toFixed(2)}%\n`;
  report += `  Precision: ${(metrics.precision * 100).toFixed(2)}%\n`;
  report += `  Recall:    ${(metrics.recall * 100).toFixed(2)}%\n`;
  report += `  F1-Score:  ${(metrics.f1Score * 100).toFixed(2)}%\n\n`;

  if (metrics.classMetrics) {
    report += `Per-Class Metrics:\n`;
    report += `------------------\n`;
    Object.entries(metrics.classMetrics).forEach(([label, classMetric]) => {
      report += `\nClass: ${label}\n`;
      report += `  Precision: ${(classMetric.precision * 100).toFixed(2)}%\n`;
      report += `  Recall:    ${(classMetric.recall * 100).toFixed(2)}%\n`;
      report += `  F1-Score:  ${(classMetric.f1Score * 100).toFixed(2)}%\n`;
      report += `  Support:   ${classMetric.support}\n`;
    });
  }

  report += `\nConfusion Matrix:\n`;
  report += metrics.confusionMatrix.map(row => row.join('\t')).join('\n');

  return report;
}
