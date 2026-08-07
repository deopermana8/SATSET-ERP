export type TestKind = "unit" | "integration" | "e2e" | "regression" | "snapshot" | "benchmark" | "stress";

export interface TestCase {
  kind: TestKind;
  name: string;
  run(): Promise<void>;
}

export interface TestResult {
  durationMs: number;
  error?: string;
  kind: TestKind;
  name: string;
  passed: boolean;
}

export interface TestSummary {
  failed: number;
  passed: number;
  results: TestResult[];
  total: number;
}

export class Assert {
  static equal<T>(actual: T, expected: T, message: string): void {
    if (actual !== expected) {
      throw new Error(`${message} | expected=${String(expected)} actual=${String(actual)}`);
    }
  }

  static ok(value: unknown, message: string): void {
    if (!value) {
      throw new Error(message);
    }
  }

  static includes(haystack: readonly string[] | string, needle: string, message: string): void {
    const found = Array.isArray(haystack) ? haystack.includes(needle) : haystack.includes(needle);
    if (!found) {
      throw new Error(`${message} | missing=${needle}`);
    }
  }
}

export class TestRunner {
  async run(testCases: readonly TestCase[], filter?: TestKind): Promise<TestSummary> {
    const selected = typeof filter === "string" ? testCases.filter((item) => item.kind === filter) : [...testCases];
    const results: TestResult[] = [];

    for (const testCase of selected) {
      const startedAt = Date.now();
      try {
        await testCase.run();
        results.push({
          durationMs: Date.now() - startedAt,
          kind: testCase.kind,
          name: testCase.name,
          passed: true
        });
      }
      catch (error: unknown) {
        results.push({
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : String(error),
          kind: testCase.kind,
          name: testCase.name,
          passed: false
        });
      }
    }

    return {
      failed: results.filter((item) => !item.passed).length,
      passed: results.filter((item) => item.passed).length,
      results,
      total: results.length
    };
  }
}
