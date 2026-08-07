import { NameVariants } from "../utils/Naming.js";

export type CommandTarget = "module" | "plugin" | "blueprint" | "entity" | "dashboard" | "report" | "mobile" | "scanner" | "workspace";
export type SatsetCommandName = "create" | "blueprint" | "architect" | "compose" | "generate" | "make" | "workflow" | "doctor" | "repair" | "build" | "deploy" | "autofix" | "solution";
export type SatsetPresetTarget =
  | "crm"
  | "inventory"
  | "purchasing"
  | "wisata"
  | "hotel"
  | "restoran"
  | "parkir"
  | "laporan"
  | "analytics"
  | "dashboard"
  | "erp"
  | "pos"
  | "finance"
  | "hr"
  | "warehouse"
  | "reservation"
  | "ticket"
  | "visitor"
  | "destination"
  | "reporting"
  | "notification"
  | "workflow"
  | "master-data"
  | "cafe"
  | "restaurant"
  | "souvenir"
  | "membership"
  | "loyalty"
  | "employee"
  | "supplier"
  | "vendor"
  | "customer";

export interface GenerateCommand {
  verb: SatsetCommandName;
  target: CommandTarget | SatsetPresetTarget;
  name: string;
  blueprintPath?: string;
  outputDir?: string;
  blueprintType?: Exclude<CommandTarget, "plugin" | "blueprint">;
  arguments: string[];
}

export interface EntityBlueprintItem {
  name: string;
  label?: string;
  description?: string;
}

export interface FieldBlueprint {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  default?: string;
  label: string;
  searchable: boolean;
  filterable: boolean;
  input: string;
}

export interface RelationBlueprint {
  name: string;
  target: string;
  kind: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
}

export interface ValidationBlueprint {
  field: string;
  rule: string;
  message: string;
}

export interface WorkflowStepBlueprint {
  name: string;
  actor: string;
  next: string[];
}

export interface WorkflowBlueprint {
  name: string;
  steps: WorkflowStepBlueprint[];
}

export interface ApiBlueprint {
  name: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  permission: string;
}

export interface SeedBlueprint {
  name: string;
  fields: Record<string, string>;
}

export interface SidebarBlueprint {
  title: string;
  items: MenuBlueprint[];
}

export interface PermissionBlueprint {
  key: string;
  description: string;
}

export interface DashboardWidgetBlueprint {
  name: string;
  type: "metric" | "chart" | "list";
  metric: string;
}

export interface DashboardBlueprint {
  widgets: DashboardWidgetBlueprint[];
}

export interface ReportBlueprint {
  name: string;
  title: string;
  metrics: string[];
}

export interface MenuBlueprint {
  label: string;
  path: string;
  icon: string;
}

export interface MobileBlueprint {
  screen: string;
  offline: boolean;
}

export interface ScannerBlueprint {
  provider: string;
  schedule: string;
}

export interface ModuleBlueprint {
  module: string;
  entity: string | string[];
  entities?: EntityBlueprintItem[];
  description: string;
  fields: FieldBlueprint[];
  relations: RelationBlueprint[];
  permissions: PermissionBlueprint[];
  dashboard: DashboardBlueprint;
  reports: ReportBlueprint[];
  menu: MenuBlueprint[];
  sidebar?: SidebarBlueprint;
  mobile: MobileBlueprint;
  scanner: ScannerBlueprint;
  workflow?: WorkflowBlueprint[];
  api?: ApiBlueprint[];
  validation?: ValidationBlueprint[];
  seed?: SeedBlueprint[];
  metadata: Record<string, string>;
}

export interface NormalizedBlueprint {
  module: string;
  entity: string;
  description: string;
  entities: EntityBlueprintItem[];
  fields: FieldBlueprint[];
  relations: RelationBlueprint[];
  permissions: PermissionBlueprint[];
  dashboard: DashboardBlueprint;
  reports: ReportBlueprint[];
  menu: MenuBlueprint[];
  sidebar: SidebarBlueprint;
  mobile: MobileBlueprint;
  scanner: ScannerBlueprint;
  workflow: WorkflowBlueprint[];
  api: ApiBlueprint[];
  validation: ValidationBlueprint[];
  seed: SeedBlueprint[];
  metadata: Record<string, string>;
}

export interface TemplateTask {
  template: string;
  output: string;
  conditionPath?: string;
  model?: Record<string, unknown>;
}

export interface GeneratedArtifact {
  contentHash: string;
  outputPath: string;
  plugin: string;
  template: string;
}

export interface GeneratorRunResult {
  artifacts: GeneratedArtifact[];
  pluginOrder: string[];
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  priority: number;
  dependencies: readonly string[];
  targets: readonly Exclude<CommandTarget, "plugin" | "blueprint">[];
  capabilities: readonly string[];
}

export interface PluginKnowledge {
  capability: string;
  description: string;
  plugin: string;
}

export interface GeneratorContextNames {
  module: NameVariants;
  entity: NameVariants;
}

export interface EntityPlan {
  entity: EntityBlueprintItem;
  normalizedBlueprint: NormalizedBlueprint;
}

export interface PipelineStage {
  name: string;
  pluginNames: string[];
}

export interface PipelineDefinition {
  entityPlans: EntityPlan[];
  stages: PipelineStage[];
}

export interface ProjectModel {
  buildLogs: string[];
  dependencyGraph: Array<{ dependencies: string[]; name: string }>;
  eslintFiles: string[];
  generatorPlugins: string[];
  nextConfigFiles: string[];
  packageJsonFiles: string[];
  pnpmFiles: string[];
  prismaFiles: string[];
  reactFiles: string[];
  tsconfigFiles: string[];
  workspaceRoot: string;
}

export interface BusinessRuleDefinition {
  name: string;
  description: string;
  appliesTo: string[];
}

export interface ArchitectContextLike {
  readonly generatorRoot: string;
  readonly requirement: string;
  readonly projectRoot: string;
  createBlueprint(seed: Partial<NormalizedBlueprint>): NormalizedBlueprint;
}

export interface ProjectAnalyzerContextLike {
  readonly generatorRoot: string;
  readonly projectRoot: string;
}

export interface KnowledgeRegistryReport {
  capabilities: PluginKnowledge[];
  plugins: string[];
}

export interface DiagnosticItem {
  category: string;
  code: string;
  message: string;
  ok: boolean;
  subject: string;
}

export interface DoctorReport {
  diagnostics: DiagnosticItem[];
  ok: boolean;
}

export interface RepairReport {
  attempts: number;
  buildStatus: string;
  doctor: DoctorReport;
  ok: boolean;
}

export interface GeneratorPlugin {
  readonly manifest: PluginManifest;
  analyzeProject?(project: ProjectModel, context: ProjectAnalyzerContextLike): Promise<ProjectModel>;
  architect?(context: ArchitectContextLike): Promise<NormalizedBlueprint | null>;
  afterGenerate(context: GeneratorContextLike, result: GeneratorRunResult): Promise<void>;
  beforeGenerate(context: GeneratorContextLike): Promise<void>;
  contributeBusinessRules?(blueprint: NormalizedBlueprint): Promise<BusinessRuleDefinition[]>;
  enrichBlueprint?(blueprint: NormalizedBlueprint): Promise<NormalizedBlueprint>;
  dependencies(): readonly string[];
  generate(context: GeneratorContextLike): Promise<GeneratedArtifact[]>;
  knowledge?(): Promise<PluginKnowledge[]>;
  refactorProject?(project: ProjectModel): Promise<ProjectModel>;
  validate(context: GeneratorContextLike): Promise<void>;
}

export interface GeneratorContextLike {
  readonly blueprint: NormalizedBlueprint;
  readonly command: GenerateCommand;
  readonly currentEntity: EntityBlueprintItem;
  readonly generatedAt: string;
  readonly generatorRoot: string;
  readonly names: GeneratorContextNames;
  readonly outputRoot: string;
  readonly projectRoot: string;
  ensureBlueprintValue(pathExpression: string): void;
  generateFromTasks(pluginName: string, tasks: readonly TemplateTask[]): Promise<GeneratedArtifact[]>;
  getBlueprintValue(pathExpression: string): unknown;
  log(level: "debug" | "info" | "warn" | "error", message: string): void;
}

export interface PluginScaffoldRequest {
  className: string;
  generatorRoot: string;
}
