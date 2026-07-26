import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";
import { getBrainIdea, emitReasoningArtifact } from "./reasoningBrain.js";

interface ReasoningBrainMetadata {
  intent?: string;
  domain?: string;
  features?: string[];
  constraints?: string[];
  architecture?: string;
  tasks?: string[];
  prompt?: string;
  reflection?: string;
  confidence?: number;
}

export class ProjectReasonerEngine implements IEngine {
  public readonly name = "ProjectReasonerEngine";

  async run(context: Context): Promise<void> {
    const idea = getBrainIdea(context);
    await emitReasoningArtifact(context, "intent.json", "intent.json.tpl", { idea, summary: `Reasoning intent for ${idea}` });
    context.metadata = { ...context.metadata, reasoningBrain: { ...(context.metadata?.reasoningBrain as Record<string, unknown> | undefined), intent: `Reasoning intent for ${idea}` } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata };
  }
}

export class IntentAnalyzerEngine implements IEngine {
  public readonly name = "IntentAnalyzerEngine";

  async run(context: Context): Promise<void> {
    const idea = getBrainIdea(context);
    await emitReasoningArtifact(context, "intent.json", "intent.json.tpl", { idea, summary: `Intent analysis for ${idea}` });
    context.metadata = { ...context.metadata, reasoningBrain: { ...(context.metadata?.reasoningBrain as Record<string, unknown> | undefined), intent: `Intent analysis for ${idea}` } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata };
  }
}

export class DomainAnalyzerEngine implements IEngine {
  public readonly name = "DomainAnalyzerEngine";

  async run(context: Context): Promise<void> {
    const idea = getBrainIdea(context);
    await emitReasoningArtifact(context, "domain.json", "domain.json.tpl", { idea, domain: "travel-and-tourism" });
    context.metadata = { ...context.metadata, reasoningBrain: { ...(context.metadata?.reasoningBrain as Record<string, unknown> | undefined), domain: "travel-and-tourism" } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata };
  }
}

export class FeaturePlannerEngine implements IEngine {
  public readonly name = "FeaturePlannerEngine";

  async run(context: Context): Promise<void> {
    const idea = getBrainIdea(context);
    await emitReasoningArtifact(context, "features.json", "features.json.tpl", { idea, features: "booking,checkout,inventory,analytics" });
    context.metadata = { ...context.metadata, reasoningBrain: { ...(context.metadata?.reasoningBrain as Record<string, unknown> | undefined), features: ["booking", "checkout", "inventory", "analytics"] } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata };
  }
}

export class ConstraintAnalyzerEngine implements IEngine {
  public readonly name = "ConstraintAnalyzerEngine";

  async run(context: Context): Promise<void> {
    const idea = getBrainIdea(context);
    await emitReasoningArtifact(context, "constraints.json", "constraints.json.tpl", { idea, constraints: "offline-first,secure,scalable" });
    context.metadata = { ...context.metadata, reasoningBrain: { ...(context.metadata?.reasoningBrain as Record<string, unknown> | undefined), constraints: ["offline-first", "secure", "scalable"] } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata };
  }
}

export class ArchitectureReasonerEngine implements IEngine {
  public readonly name = "ArchitectureReasonerEngine";

  async run(context: Context): Promise<void> {
    const idea = getBrainIdea(context);
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "architecture-reasoning",
      name: "architecture-reasoning",
      templatePath: path.join(context.projectRoot, "templates", "architecture-reasoning.md.tpl"),
      outputPath: path.join(context.projectRoot, "architecture-reasoning.md"),
      variables: { idea, architecture: "modular-service-based" },
    }]);
    context.metadata = { ...context.metadata, reasoningBrain: { ...(context.metadata?.reasoningBrain as Record<string, unknown> | undefined), architecture: "modular-service-based" } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata };
  }
}

export class TaskBreakdownEngine implements IEngine {
  public readonly name = "TaskBreakdownEngine";

  async run(context: Context): Promise<void> {
    const idea = getBrainIdea(context);
    await emitReasoningArtifact(context, "tasks.json", "tasks.json.tpl", { idea, tasks: "scaffold,implement,verify" });
    context.metadata = { ...context.metadata, reasoningBrain: { ...(context.metadata?.reasoningBrain as Record<string, unknown> | undefined), tasks: ["scaffold", "implement", "verify"] } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata };
  }
}

export class PromptCompilerEngine implements IEngine {
  public readonly name = "PromptCompilerEngine";

  async run(context: Context): Promise<void> {
    const idea = getBrainIdea(context);
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "compiled-prompt",
      name: "compiled-prompt",
      templatePath: path.join(context.projectRoot, "templates", "compiled-prompt.md.tpl"),
      outputPath: path.join(context.projectRoot, "compiled-prompt.md"),
      variables: { idea, prompt: `Generate a production-ready implementation for ${idea}` },
    }]);
    context.metadata = { ...context.metadata, reasoningBrain: { ...(context.metadata?.reasoningBrain as Record<string, unknown> | undefined), prompt: `Generate a production-ready implementation for ${idea}` } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata };
  }
}

export class ReflectionEngine implements IEngine {
  public readonly name = "ReflectionEngine";

  async run(context: Context): Promise<void> {
    const idea = getBrainIdea(context);
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "reflection",
      name: "reflection",
      templatePath: path.join(context.projectRoot, "templates", "reflection.md.tpl"),
      outputPath: path.join(context.projectRoot, "reflection.md"),
      variables: { idea, reflection: `Review the plan for ${idea}` },
    }]);
    context.metadata = { ...context.metadata, reasoningBrain: { ...(context.metadata?.reasoningBrain as Record<string, unknown> | undefined), reflection: `Review the plan for ${idea}` } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata };
  }
}

export class CriticEngine implements IEngine {
  public readonly name = "CriticEngine";

  async run(context: Context): Promise<void> {
    const brain = (context.metadata?.reasoningBrain as ReasoningBrainMetadata | undefined) ?? {};
    context.metadata = { ...context.metadata, reasoningBrain: { ...brain, critic: "No critical blockers identified" } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata & { critic?: string } };
  }
}

export class ConfidenceEngine implements IEngine {
  public readonly name = "ConfidenceEngine";

  async run(context: Context): Promise<void> {
    const brain = (context.metadata?.reasoningBrain as ReasoningBrainMetadata | undefined) ?? {};
    const confidence = brain.features?.length && brain.constraints?.length ? 0.91 : 0.75;
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "confidence",
      name: "confidence",
      templatePath: path.join(context.projectRoot, "templates", "confidence.json.tpl"),
      outputPath: path.join(context.projectRoot, "confidence.json"),
      variables: { confidence: confidence.toFixed(2) },
    }]);
    context.metadata = { ...context.metadata, reasoningBrain: { ...brain, confidence } } as typeof context.metadata & { reasoningBrain?: ReasoningBrainMetadata & { confidence?: number } };
  }
}
