export type GeneratorCapability = "app" | "website" | "landing" | "api" | "mobile" | "desktop" | "ebook" | "documentation";

export interface GenerationContext {
  requirement: string;
  projectType: string;
  modules: string[];
  outputDir: string;
  capability?: GeneratorCapability;
}

export interface GenerationResult {
  success: boolean;
  written: string[];
  errors: string[];
  summary: string;
}

export interface IGenerator {
  capabilities: GeneratorCapability[];
  supports(type: string): boolean;
  generate(context: GenerationContext): Promise<GenerationResult>;
  /** Self-register into a registry. Default: push self. */
  register?(registry: { add(g: IGenerator): void }): void;
}
