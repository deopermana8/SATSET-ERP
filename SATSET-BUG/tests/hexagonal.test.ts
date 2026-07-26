import assert from "node:assert/strict";
import { HexagonalPlanner } from "../src/architecture/HexagonalPlanner.js";

describe("hexagonal planner", () => {
  it("returns layers", () => {
    assert.ok(new HexagonalPlanner().plan().length > 0);
  });
});
