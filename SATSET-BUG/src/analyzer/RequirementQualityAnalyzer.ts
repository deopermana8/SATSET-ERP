export interface QualityDimension {
  name: "clarity" | "completeness" | "ambiguity" | "confidence";
  score: number;
  reason: string;
}

export interface RequirementQualityReport {
  input: string;
  overallScore: number;
  dimensions: QualityDimension[];
  suggestions: string[];
  passesThreshold: boolean;
}

const DOMAIN_KEYWORDS = ["sistem", "system", "aplikasi", "app", "buat", "create", "generate", "website", "api", "mobile"];
const MODULE_KEYWORDS = ["login", "auth", "user", "product", "order", "payment", "dashboard", "report", "inventory", "employee", "customer", "transaction", "cart", "category", "supplier", "attendance", "payroll", "ticket", "booking", "citizen", "surat"];
const TECH_KEYWORDS = ["react", "next", "prisma", "postgres", "mysql", "node", "express", "typescript", "tailwind", "rest", "graphql", "jwt", "docker"];
const AMBIGUOUS_WORDS = ["stuff", "things", "data", "info", "something", "etc", "dan lain", "dsb", "dll", "various", "beberapa", "some", "sesuatu"];
const VAGUE_PHRASES = ["simple", "basic", "normal", "standard", "biasa", "sederhana", "just", "only", "hanya", "sekedar"];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function countMatches(text: string, keywords: string[]): number {
  return keywords.filter((kw) => text.includes(kw)).length;
}

function scoreClarity(text: string): QualityDimension {
  const norm = normalize(text);
  const wordCount = norm.split(/\s+/).filter(Boolean).length;
  const hasDomain = countMatches(norm, DOMAIN_KEYWORDS) > 0;
  const hasModules = countMatches(norm, MODULE_KEYWORDS);
  const vagueCount = countMatches(norm, VAGUE_PHRASES);

  let score = 50;
  if (hasDomain) score += 15;
  if (hasModules >= 3) score += 20;
  else if (hasModules >= 1) score += 10;
  if (wordCount >= 8) score += 10;
  if (wordCount >= 15) score += 5;
  score -= vagueCount * 8;

  return { name: "clarity", score: Math.max(0, Math.min(100, score)), reason: hasDomain ? `Defines domain with ${hasModules} module keywords` : "Missing domain context" };
}

function scoreCompleteness(text: string): QualityDimension {
  const norm = normalize(text);
  const modules = countMatches(norm, MODULE_KEYWORDS);
  const hasTech = countMatches(norm, TECH_KEYWORDS);
  const hasAuth = /auth|login|user|akun/.test(norm);
  const hasData = /data|database|db|prisma|mysql|postgres/.test(norm);
  const hasUI = /ui|frontend|react|next|dashboard|page/.test(norm);

  let score = 30;
  if (modules >= 5) score += 30;
  else if (modules >= 3) score += 20;
  else if (modules >= 1) score += 10;
  if (hasAuth) score += 10;
  if (hasData) score += 10;
  if (hasUI) score += 10;
  if (hasTech >= 2) score += 10;

  return { name: "completeness", score: Math.max(0, Math.min(100, score)), reason: `${modules} modules identified; auth=${hasAuth}, db=${hasData}, ui=${hasUI}` };
}

function scoreAmbiguity(text: string): QualityDimension {
  const norm = normalize(text);
  const ambiguous = countMatches(norm, AMBIGUOUS_WORDS);
  const vague = countMatches(norm, VAGUE_PHRASES);
  const hasSpecificModules = countMatches(norm, MODULE_KEYWORDS) >= 2;

  let score = 80;
  score -= ambiguous * 15;
  score -= vague * 10;
  if (hasSpecificModules) score += 10;

  return { name: "ambiguity", score: Math.max(0, Math.min(100, score)), reason: ambiguous > 0 ? `${ambiguous} ambiguous term(s) found` : "Low ambiguity" };
}

function scoreConfidence(text: string, clarity: number, completeness: number, ambiguity: number): QualityDimension {
  const norm = normalize(text);
  const hasOutput = /output|generate|create|buat|sistem|system|aplikasi|app/.test(norm);
  const weighted = (clarity * 0.35) + (completeness * 0.35) + (ambiguity * 0.3);
  const score = Math.max(0, Math.min(100, Math.round(weighted + (hasOutput ? 5 : -5))));

  return { name: "confidence", score, reason: `Weighted average of other dimensions` };
}

function buildSuggestions(report: Omit<RequirementQualityReport, "suggestions" | "passesThreshold">): string[] {
  const s: string[] = [];
  const dim = Object.fromEntries(report.dimensions.map((d) => [d.name, d.score]));

  if ((dim["clarity"] ?? 0) < 60) s.push("Clarify the domain — specify what type of system (e.g. inventory, POS, HRIS).");
  if ((dim["completeness"] ?? 0) < 60) s.push("Add specific modules — e.g. product, order, payment, authentication, dashboard.");
  if ((dim["ambiguity"] ?? 0) < 60) s.push("Remove vague terms (e.g. 'simple', 'stuff', 'etc') and replace with concrete feature names.");
  if ((dim["confidence"] ?? 0) < 60) s.push("Increase specificity: mention technologies (React, Prisma), data entities, or user roles.");
  if (!s.length && report.overallScore < 70) s.push("Add more detail about features, users, and data models.");

  return s;
}

export class RequirementQualityAnalyzer {
  analyze(requirement: string): RequirementQualityReport {
    const clarity = scoreClarity(requirement);
    const completeness = scoreCompleteness(requirement);
    const ambiguity = scoreAmbiguity(requirement);
    const confidence = scoreConfidence(requirement, clarity.score, completeness.score, ambiguity.score);

    const dimensions = [clarity, completeness, ambiguity, confidence];
    const overallScore = Math.round(
      (clarity.score * 0.3) + (completeness.score * 0.3) + (ambiguity.score * 0.2) + (confidence.score * 0.2)
    );

    const partial = { input: requirement, overallScore, dimensions };
    const suggestions = overallScore < 70 ? buildSuggestions(partial) : [];

    return { ...partial, suggestions, passesThreshold: overallScore >= 70 };
  }
}
