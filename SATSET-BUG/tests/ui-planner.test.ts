import assert from "node:assert/strict";
import { ProjectPlanner } from "../src/planner/ProjectPlanner.js";
import { UIPlanner } from "../src/planner/UIPlanner.js";

async function main(): Promise<void> {
  const planner = new ProjectPlanner();
  const uiPlanner = new UIPlanner();

  const plan = planner.plan({ requirement: "inventory", projectType: "inventory", modules: [], outputDir: "" });
  const ui = uiPlanner.plan(plan);

  // Pages
  assert.ok(ui.pages.length > 0, "must have pages");
  assert.ok(ui.pages.some((p) => p.name === "DashboardPage"), "must have DashboardPage");
  assert.ok(ui.pages.some((p) => p.name.includes("ListPage")), "must have at least one ListPage");

  // Forms
  assert.ok(ui.forms.length > 0, "must have forms");
  assert.ok(ui.forms.every((f) => f.fields.length > 0), "every form must have fields");
  assert.ok(ui.forms.every((f) => f.actions.includes("save")), "every form must have save action");

  // Tables
  assert.ok(ui.tables.length > 0, "must have tables");
  assert.ok(ui.tables.every((t) => t.columns.length > 0), "every table must have columns");
  assert.ok(ui.tables.every((t) => t.features.includes("pagination")), "every table must support pagination");

  // Dashboard
  assert.ok(ui.dashboard.cards.length > 0, "must have dashboard cards");
  assert.ok(ui.dashboard.charts.length > 0, "must have charts");

  // Sidebar / Navbar
  assert.ok(ui.sidebar.length > 0, "must have sidebar items");
  assert.ok(ui.navbar.title.length > 0, "navbar must have title");

  // Buttons
  assert.ok(ui.buttons.some((b) => b.action === "create"), "must have create button");
  assert.ok(ui.buttons.some((b) => b.action === "delete"), "must have delete button");

  // Dialogs
  assert.ok(ui.dialogs.some((d) => d.type === "confirm"), "must have confirm dialog");

  // Search & Pagination
  assert.equal(ui.breadcrumb, true, "breadcrumb must be enabled");
  assert.equal(ui.pagination, true, "pagination must be enabled");
  assert.ok(ui.search.length > 0, "must have search config");

  // Filters
  assert.ok(ui.filters.length > 0, "must have filters");

  // Export & Print
  assert.ok(ui.export.includes("csv"), "must support csv export");
  assert.ok(ui.print.length > 0, "must have print targets");

  // Permissions
  assert.ok(ui.permissions.length > 0, "must have permissions");
  const adminPerm = ui.permissions.find((p) => p.role === "admin");
  assert.ok(adminPerm, "must have admin permissions");
  assert.ok(adminPerm!.actions.includes("delete"), "admin must be able to delete");

  // Components
  assert.ok(ui.components.some((c) => c.name === "Navbar"), "must have Navbar component");
  assert.ok(ui.components.some((c) => c.name === "Pagination"), "must have Pagination component");

  console.log("ui-planner test passed");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
