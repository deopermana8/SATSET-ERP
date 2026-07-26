import type { IKnowledge } from "./IKnowledge.js";

export class KnowledgeBase {
  private readonly items: IKnowledge[] = [];

  add(item: IKnowledge): void {
    this.items.push(item);
  }

  getAll(): IKnowledge[] {
    return [...this.items];
  }

  findByCategory(category: string): IKnowledge[] {
    return this.items.filter((item) => item.category === category);
  }

  findById(id: string): IKnowledge | undefined {
    return this.items.find((item) => item.id === id);
  }
}
