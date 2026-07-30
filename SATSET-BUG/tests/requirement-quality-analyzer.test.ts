import assert from "node:assert/strict";
import { RequirementQualityAnalyzer } from "../src/analyzer/RequirementQualityAnalyzer.js";

async function main(): Promise<void> {
  const analyzer = new RequirementQualityAnalyzer();

  // High-quality requirement
  const good = analyzer.analyze("Create Inventory Management System with product category supplier purchase sales stock dashboard reports authentication REST API React");
  assert.ok(good.overallScore >= 70, `Good requirement should score >= 70, got ${good.overallScore}`);
  assert.equal(good.passesThreshold, true, "Good requirement must pass threshold");
  assert.equal(good.suggestions.length, 0, "Good requirement should have no suggestions");
  assert.equal(good.dimensions.length, 4, "Must have 4 dimensions");
  assert.ok(good.dimensions.every((d) => d.score >= 0 && d.score <= 100), "All scores must be 0-100");

  // Low-quality requirement
  const bad = analyzer.analyze("make something");
  assert.ok(bad.overallScore < 70, `Vague requirement should score < 70, got ${bad.overallScore}`);
  assert.equal(bad.passesThreshold, false, "Vague requirement must not pass threshold");
  assert.ok(bad.suggestions.length > 0, "Vague requirement must have suggestions");

  // Scores for each dimension
  const dims = good.dimensions.map((d) => d.name);
  assert.ok(dims.includes("clarity"), "must have clarity");
  assert.ok(dims.includes("completeness"), "must have completeness");
  assert.ok(dims.includes("ambiguity"), "must have ambiguity");
  assert.ok(dims.includes("confidence"), "must have confidence");

  // Ambiguity penalty for vague phrases
  const vague = analyzer.analyze("simple basic stuff with some things");
  assert.ok(vague.dimensions.find((d) => d.name === "ambiguity")!.score < 60, "vague text should have low ambiguity score");

  // Medium quality
  const medium = analyzer.analyze("buat aplikasi kasir");
  assert.ok(medium.overallScore >= 0 && medium.overallScore <= 100, "score must be in range");

  console.log(`Good: ${good.overallScore} | Bad: ${bad.overallScore} | Medium: ${medium.overallScore}`);
  console.log("Suggestions for bad:", bad.suggestions);
  console.log("requirement-quality-analyzer test passed");
}

void main().catch((err) => { console.error(err); process.exitCode = 1; });
