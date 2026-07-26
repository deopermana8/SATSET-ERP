export interface SearchResult {
  id: string;
  score: number;
  summary: string;
}

export class SemanticSearch {
  search(items: Array<{ id: string; summary: string }>, query: string): SearchResult[] {
    const lowered = query.toLowerCase();
    return items
      .filter((item) => item.summary.toLowerCase().includes(lowered) || item.id.toLowerCase().includes(lowered))
      .map((item) => ({ id: item.id, score: 1, summary: item.summary }));
  }
}
