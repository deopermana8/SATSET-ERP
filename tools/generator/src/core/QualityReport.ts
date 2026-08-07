import { DoctorReport, GeneratorPlugin } from "../sdk/contracts.js";
import { HealthMetric, HealthScoreCalculator, HealthScoreReport } from "./HealthScore.js";

export interface BenchmarkEntry {
  durationMs: number;
  name: string;
}

export interface QualityReport {
  benchmark: BenchmarkEntry[];
  coverage: number;
  errors: number;
  generators: number;
  health: HealthScoreReport;
  blueprints: number;
  plugins: number;
  rules: number;
  tests: number;
  warnings: number;
}

export interface IQualityReportBuilder {
  build(input: {
    benchmark: BenchmarkEntry[];
    blueprints: number;
    doctor: DoctorReport;
    generators: number;
    plugins: readonly GeneratorPlugin[];
    rules: number;
    tests: { passed: number; total: number };
    warnings: number;
  }): QualityReport;
}

export class QualityReportBuilder implements IQualityReportBuilder {
  private readonly healthScoreCalculator = new HealthScoreCalculator();

  build(input: {
    benchmark: BenchmarkEntry[];
    blueprints: number;
    doctor: DoctorReport;
    generators: number;
    plugins: readonly GeneratorPlugin[];
    rules: number;
    tests: { passed: number; total: number };
    warnings: number;
  }): QualityReport {
    const errors = input.doctor.diagnostics.filter((item) => !item.ok).length;
    const coverage = input.tests.total === 0 ? 100 : Math.round((input.tests.passed / input.tests.total) * 100);
    const healthMetrics: HealthMetric[] = [
      { name: "Generator", ok: input.plugins.length > 0, weight: 2 },
      { name: "AutoFix", ok: input.rules > 0, weight: 2 },
      { name: "Registry", ok: input.plugins.length > 0 && input.rules > 0, weight: 2 },
      { name: "CLI", ok: input.generators > 0, weight: 1 },
      { name: "Blueprint", ok: input.blueprints > 0, weight: 1 },
      { name: "Doctor", ok: input.doctor.ok, weight: 1 },
      { name: "Repair", ok: input.doctor.ok, weight: 1 }
    ];

    return {
      benchmark: input.benchmark,
      coverage,
      errors,
      generators: input.generators,
      health: this.healthScoreCalculator.calculate(healthMetrics),
      blueprints: input.blueprints,
      plugins: input.plugins.length,
      rules: input.rules,
      tests: input.tests.total,
      warnings: input.warnings
    };
  }
}
