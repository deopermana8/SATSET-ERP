export class TradeoffEngine {
  score(options: Array<{ name: string; cost: number; benefit: number }>): Array<{ name: string; cost: number; benefit: number; score: number }> {
    return options.map((option) => ({ ...option, score: option.benefit - option.cost }));
  }
}
