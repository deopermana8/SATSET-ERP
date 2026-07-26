import assert from "node:assert/strict";
import { PatternEngine } from "../src/architecture/PatternEngine.js";

describe("pattern engine", () => {
  it("selects patterns", () => {
    const selected = new PatternEngine().select([
      { id: "a", name: "Modular Monolith", summary: "balanced" },
      { id: "b", name: "DDD", summary: "domain" },
      { id: "c", name: "Hexagonal", summary: "ports" },
    ]);

    assert.equal(selected.length, 3);
  });
});
