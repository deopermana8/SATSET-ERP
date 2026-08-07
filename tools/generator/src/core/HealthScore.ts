export interface HealthMetric {
  name: string;
  ok: boolean;
  weight: number;
}

export interface HealthScoreReport {
  percentage: number;
  metrics: HealthMetric[];
}

export interface IHealthScoreCalculator {
  calculate(metrics: readonly HealthMetric[]): HealthScoreReport;
}

export class HealthScoreCalculator implements IHealthScoreCalculator {
  calculate(metrics: readonly HealthMetric[]): HealthScoreReport {
    const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
    const earnedWeight = metrics.reduce((sum, metric) => sum + (metric.ok ? metric.weight : 0), 0);
    const percentage = totalWeight === 0 ? 100 : Math.round((earnedWeight / totalWeight) * 100);

    return {
      percentage,
      metrics: [...metrics]
    };
  }
}
