export interface StrategyOption {
  id: string;
  name: string;
  score: number;
}

export class StrategyEngine {
  compare(options: StrategyOption[]): StrategyOption[] {
    return [...options].sort((left, right) => right.score - left.score);
  }
}
