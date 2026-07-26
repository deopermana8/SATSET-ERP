export class CachingPlanner {
  plan(): string[] {
    return ["Redis", "cache-aside", "TTL"];
  }
}
