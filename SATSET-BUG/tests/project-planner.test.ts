import assert from "node:assert/strict";
import { ProjectPlanner } from "../src/planner/ProjectPlanner.js";

async function main(): Promise<void> {
  const planner = new ProjectPlanner();

  // Test: Inventory
  const inventoryPlan = planner.plan({ requirement: "inventory", projectType: "inventory", modules: [], outputDir: "" });
  assert.ok(inventoryPlan.modules.includes("product"), "inventory: must include product");
  assert.ok(inventoryPlan.modules.includes("supplier"), "inventory: must include supplier");
  assert.ok(inventoryPlan.modules.includes("stock"), "inventory: must include stock");
  assert.ok(inventoryPlan.reports.length > 0, "inventory: must have reports");
  assert.ok(inventoryPlan.authentication, "inventory: must require authentication");

  // Test: POS
  const posPlan = planner.plan({ requirement: "pos", projectType: "pos", modules: [], outputDir: "" });
  assert.ok(posPlan.modules.includes("cashier"), "pos: must include cashier");
  assert.ok(posPlan.modules.includes("transaction"), "pos: must include transaction");
  assert.ok(posPlan.modules.includes("receipt"), "pos: must include receipt");
  assert.ok(posPlan.dashboard.length > 0, "pos: must have dashboard items");

  // Test: HRIS
  const hrisPlan = planner.plan({ requirement: "hris", projectType: "hris", modules: [], outputDir: "" });
  assert.ok(hrisPlan.modules.includes("employee"), "hris: must include employee");
  assert.ok(hrisPlan.modules.includes("payroll"), "hris: must include payroll");
  assert.ok(hrisPlan.modules.includes("attendance"), "hris: must include attendance");

  // Test: pages are generated
  assert.ok(inventoryPlan.pages.includes("DashboardPage"), "must include DashboardPage");
  assert.ok(posPlan.pages.includes("LoginPage"), "pos: must include LoginPage");

  // Test: api endpoints are generated
  assert.ok(inventoryPlan.api.length > 0, "inventory: must have api endpoints");

  // Test: navigation is generated
  assert.ok(inventoryPlan.navigation.length > 0, "inventory: must have navigation items");

  // Test: project structure is generated
  assert.ok(inventoryPlan.structure.frontend.length > 0, "must have frontend structure");
  assert.ok(inventoryPlan.structure.backend.length > 0, "must have backend structure");

  // Test: fallback for unknown type
  const fallback = planner.plan({ requirement: "custom app", projectType: "unknown", modules: ["product", "order"], outputDir: "" });
  assert.ok(fallback.entities.includes("Product"), "fallback: must include Product entity");
  assert.ok(fallback.entities.includes("Order"), "fallback: must include Order entity");

  console.log("project-planner test passed");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
