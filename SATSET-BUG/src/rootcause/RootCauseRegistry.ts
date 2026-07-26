import type { RootCause } from "./RootCause.js";

export type RootCauseDetector = (issues: readonly any[]) => RootCause[];

export class RootCauseRegistry {
  private detectors: RootCauseDetector[] = [];

  register(detector: RootCauseDetector): void {
    this.detectors.push(detector);
  }

  getDetectors(): RootCauseDetector[] {
    return [...this.detectors];
  }
}

export default RootCauseRegistry;
