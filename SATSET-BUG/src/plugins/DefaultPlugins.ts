import type { IPlugin } from "./IPlugin.js";

abstract class BuiltinPluginBase implements IPlugin {
  public abstract readonly id: string;
  public abstract readonly name: string;

  register(): void {
    // Bootstrap registration only. Runtime behavior is intentionally unchanged.
  }
}

export class PrismaPlugin extends BuiltinPluginBase {
  public readonly id = "builtin-prisma";
  public readonly name = "PrismaPlugin";
  public readonly manifest = {
    id: "builtin-prisma",
    name: "PrismaPlugin",
    version: "1.0.0",
    category: "prisma",
    author: "SATSET",
  };
}

export class NextPlugin extends BuiltinPluginBase {
  public readonly id = "builtin-next";
  public readonly name = "NextPlugin";
  public readonly manifest = {
    id: "builtin-next",
    name: "NextPlugin",
    version: "1.0.0",
    category: "next",
    author: "SATSET",
  };
}

export class ReactPlugin extends BuiltinPluginBase {
  public readonly id = "builtin-react";
  public readonly name = "ReactPlugin";
  public readonly manifest = {
    id: "builtin-react",
    name: "ReactPlugin",
    version: "1.0.0",
    category: "react",
    author: "SATSET",
  };
}

export class TypeScriptPlugin extends BuiltinPluginBase {
  public readonly id = "builtin-typescript";
  public readonly name = "TypeScriptPlugin";
  public readonly manifest = {
    id: "builtin-typescript",
    name: "TypeScriptPlugin",
    version: "1.0.0",
    category: "typescript",
    author: "SATSET",
  };
}
