import assert from "node:assert/strict";
import { ArchitectureScorer } from "../src/architecture/ArchitectureScorer.js";

describe("architecture scorer", () => {
  it("scores candidates", () => {
    const scored = new ArchitectureScorer().score([
      { name: "Monolith", rationale: "Simple", complexity: "small" },
      { name: "Modular Monolith", rationale: "Balanced", complexity: "medium" },
    ]);

    assert.equal(scored[0].name, "Monolith");
    assert.equal(scored[1].name, "Modular Monolith");
  });
});
