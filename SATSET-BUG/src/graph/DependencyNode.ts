export type NodeType =
  | "project"
  | "dependency"
  | "framework"
  | "plugin"
  | "runtime"
  | "issue"
  | "rootcause";

export interface DependencyNode {
  id: string;
  type: NodeType;
  name: string;
  meta?: Record<string, unknown>;
}

export class DepNode implements DependencyNode {
  id: string;
  type: NodeType;
  name: string;
  meta?: Record<string, unknown>;

  constructor(id: string, type: NodeType, name: string, meta?: Record<string, unknown>) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.meta = meta;
  }
}

export default DepNode;
