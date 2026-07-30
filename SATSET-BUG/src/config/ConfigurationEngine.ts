export type ConfigTarget =
  | "next"
  | "react"
  | "node"
  | "prisma"
  | "typescript"
  | "eslint"
  | "turbo"
  | "docker"
  | "tailwind";

export interface ConfigurationEngineOptions {
  projectName?: string;
  nodeVersion?: string;
  strictMode?: boolean;
  srcDir?: string;
  outDir?: string;
}

export class ConfigurationEngine {
  private readonly opts: Required<ConfigurationEngineOptions>;
  private readonly cache: Map<ConfigTarget, Record<string, unknown>> = new Map();

  constructor(opts: ConfigurationEngineOptions = {}) {
    this.opts = {
      projectName: opts.projectName ?? "app",
      nodeVersion: opts.nodeVersion ?? "20",
      strictMode: opts.strictMode ?? true,
      srcDir: opts.srcDir ?? "src",
      outDir: opts.outDir ?? "dist",
    };
  }

  get(target: ConfigTarget): Record<string, unknown> {
    const cached = this.cache.get(target);
    if (cached) return cached;
    const config = this.build(target);
    this.cache.set(target, config);
    return config;
  }

  getJson(target: ConfigTarget): string {
    return JSON.stringify(this.get(target), null, 2);
  }

  private build(target: ConfigTarget): Record<string, unknown> {
    switch (target) {
      case "typescript": return this.typescript();
      case "next": return this.next();
      case "react": return this.react();
      case "node": return this.node();
      case "prisma": return this.prisma();
      case "eslint": return this.eslint();
      case "turbo": return this.turbo();
      case "docker": return this.docker();
      case "tailwind": return this.tailwind();
    }
  }

  private typescript(): Record<string, unknown> {
    return {
      compilerOptions: {
        target: "ES2022",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: this.opts.strictMode,
        outDir: this.opts.outDir,
        rootDir: this.opts.srcDir,
        skipLibCheck: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: [this.opts.srcDir],
      exclude: ["node_modules", this.opts.outDir],
    };
  }

  private next(): Record<string, unknown> {
    return {
      reactStrictMode: true,
      swcMinify: true,
      poweredByHeader: false,
      compress: true,
      output: "standalone",
      experimental: { typedRoutes: false },
    };
  }

  private react(): Record<string, unknown> {
    return {
      compilerOptions: {
        target: "ES2020",
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        strict: this.opts.strictMode,
        skipLibCheck: true,
        noEmit: true,
      },
      include: [this.opts.srcDir],
    };
  }

  private node(): Record<string, unknown> {
    return {
      name: this.opts.projectName,
      version: "0.1.0",
      type: "module",
      engines: { node: `>=${this.opts.nodeVersion}` },
      scripts: {
        build: "tsc",
        dev: `tsx ${this.opts.srcDir}/index.ts`,
        start: `node ${this.opts.outDir}/index.js`,
        typecheck: "tsc --noEmit",
        test: "node --experimental-vm-modules node_modules/.bin/jest",
      },
    };
  }

  private prisma(): Record<string, unknown> {
    return {
      generator: { provider: "prisma-client-js" },
      datasource: { provider: "postgresql", url: "env(\"DATABASE_URL\")" },
    };
  }

  private eslint(): Record<string, unknown> {
    return {
      root: true,
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
      ],
      rules: {
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
        "no-console": "off",
      },
      env: { node: true, es2022: true },
    };
  }

  private turbo(): Record<string, unknown> {
    return {
      $schema: "https://turbo.build/schema.json",
      pipeline: {
        build: { dependsOn: ["^build"], outputs: [`${this.opts.outDir}/**`] },
        typecheck: { dependsOn: ["^typecheck"] },
        dev: { cache: false, persistent: true },
        test: { dependsOn: ["build"] },
      },
    };
  }

  private docker(): Record<string, unknown> {
    return {
      baseImage: `node:${this.opts.nodeVersion}-alpine`,
      workdir: "/app",
      expose: [3000],
      buildStages: ["deps", "builder", "runner"],
      env: { NODE_ENV: "production", PORT: "3000" },
    };
  }

  private tailwind(): Record<string, unknown> {
    return {
      content: [
        `./${this.opts.srcDir}/**/*.{js,ts,jsx,tsx}`,
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          colors: { primary: "#1e293b", secondary: "#3b82f6" },
          fontFamily: { sans: ["system-ui", "sans-serif"] },
        },
      },
      plugins: [],
    };
  }
}
