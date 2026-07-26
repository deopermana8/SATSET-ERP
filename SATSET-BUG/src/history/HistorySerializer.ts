import stringify from "json-stable-stringify";
import type { HistoryRecord } from "./History.js";

export class HistorySerializer {
  serialize(record: HistoryRecord): string {
    const result = stringify(record as unknown as object, { space: 2 });
    return typeof result === "string" ? result : JSON.stringify(record, null, 2);
  }

  deserialize(content: string): HistoryRecord {
    return JSON.parse(content) as HistoryRecord;
  }
}
