import type { IAutoFix } from "./IAutoFix.js";

export class AutoFixRegistry {
  private readonly fixes: IAutoFix[] = [];

  register(fix: IAutoFix): void {
    this.fixes.push(fix);
  }

  getFixes(): IAutoFix[] {
    return [...this.fixes];
  }
}

export default AutoFixRegistry;
