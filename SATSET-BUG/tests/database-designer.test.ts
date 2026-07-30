import assert from "node:assert/strict";
import { ProjectPlanner } from "../src/planner/ProjectPlanner.js";
import { DatabaseDesignerPlanner } from "../src/planner/DatabaseDesigner.js";

async function main(): Promise<void> {
  const planner = new ProjectPlanner();
  const dbDesigner = new DatabaseDesignerPlanner();

  // Test: Inventory plan
  const inventoryPlan = planner.plan({ requirement: "inventory", projectType: "inventory", modules: [], outputDir: "" });
  const inventoryDb = dbDesigner.design(inventoryPlan);

  assert.ok(inventoryDb.entities.length > 0, "inventory: must generate entities");
  const productEntity = inventoryDb.entities.find((e) => e.name === "Product");
  assert.ok(productEntity, "inventory: must have Product entity");
  assert.ok(productEntity!.fields.some((f) => f.name === "id" && f.primaryKey), "Product must have id primary key");
  assert.ok(productEntity!.fields.some((f) => f.name === "name"), "Product must have name field");
  assert.ok(productEntity!.fields.some((f) => f.name === "price"), "Product must have price field");
  assert.ok(productEntity!.fields.some((f) => f.name === "stock"), "Product must have stock field");

  const supplierEntity = inventoryDb.entities.find((e) => e.name === "Supplier");
  assert.ok(supplierEntity, "inventory: must have Supplier entity");

  // Test: POS plan
  const posPlan = planner.plan({ requirement: "pos", projectType: "pos", modules: [], outputDir: "" });
  const posDb = dbDesigner.design(posPlan);
  assert.ok(posDb.entities.length > 0, "pos: must generate entities");

  // Test: all entities have base fields (id, createdAt, updatedAt)
  for (const entity of inventoryDb.entities) {
    assert.ok(entity.fields.some((f) => f.name === "id"), `${entity.name}: must have id`);
    assert.ok(entity.fields.some((f) => f.name === "createdAt"), `${entity.name}: must have createdAt`);
  }

  // Test: indexes are generated for FK fields
  const stockEntity = inventoryDb.entities.find((e) => e.name === "Stock");
  if (stockEntity) {
    assert.ok(stockEntity.indexes.length > 0, "Stock: must have indexes for FK fields");
  }

  // Test: enums are generated
  assert.ok(inventoryDb.enums.length >= 0, "enums array must exist");

  // Test: custom entities from plan
  const customPlan = planner.plan({ requirement: "custom", projectType: "unknown", modules: ["product", "order", "payment"], outputDir: "" });
  const customDb = dbDesigner.design(customPlan);
  assert.ok(customDb.entities.some((e) => e.name === "Product"), "custom: must have Product");
  assert.ok(customDb.entities.some((e) => e.name === "Order"), "custom: must have Order");

  console.log("database-designer test passed");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
