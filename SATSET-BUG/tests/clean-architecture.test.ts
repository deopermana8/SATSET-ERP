import assert from "node:assert/strict";
import { CleanArchitecturePlanner } from "../src/architecture/CleanArchitecturePlanner.js";

describe("clean architecture planner", () => {
  it("returns layers", () => {
    assert.ok(new CleanArchitecturePlanner().plan().length > 0);
  });
});
