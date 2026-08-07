import { QualityReport } from "./QualityReport.js";

export interface ContinuousValidationResult {
  ok: boolean;
  steps: string[];
}

export interface IContinuousValidator {
  run(input: {
    build: () => Promise<boolean>;
    runAutofix: () => Promise<boolean>;
    runTests: () => Promise<boolean>;
    runValidation: () => Promise<boolean>;
  }): Promise<ContinuousValidationResult>;
}

export class ContinuousValidator implements IContinuousValidator {
  async run(input: {
    build: () => Promise<boolean>;
    runAutofix: () => Promise<boolean>;
    runTests: () => Promise<boolean>;
    runValidation: () => Promise<boolean>;
  }): Promise<ContinuousValidationResult> {
    const steps: string[] = [];
    const validationOk = await input.runValidation();
    steps.push(`validation:${validationOk ? "ok" : "fail"}`);
    const testsOk = await input.runTests();
    steps.push(`test:${testsOk ? "ok" : "fail"}`);
    const buildOk = await input.build();
    steps.push(`build:${buildOk ? "ok" : "fail"}`);
    const autofixOk = await input.runAutofix();
    steps.push(`autofix:${autofixOk ? "ok" : "fail"}`);
    const finalBuildOk = await input.build();
    steps.push(`build:${finalBuildOk ? "ok" : "fail"}`);

    return {
      ok: validationOk && testsOk && buildOk && autofixOk && finalBuildOk,
      steps
    };
  }
}
