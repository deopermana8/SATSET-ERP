import { BuildErrorType, Diagnostic, ProjectInfo } from "./types.js";

interface FileSystemModule {
  readFileSync(path: string, encoding: string): string;
}

interface PathModule {
  sep: string;
}

interface IdentityPattern {
  category: string;
  pattern: RegExp;
  recommendation: string;
}

const fs = require("node:fs") as FileSystemModule;
const path = require("node:path") as PathModule;

const IDENTITY_PATTERNS: readonly IdentityPattern[] = [
  {
    category: "login-manual",
    pattern: /(router\.(post|get|put|patch)\s*\(\s*['"`]\/?(login|logout|register|forgot-password|reset-password|change-password|refresh-token)|app\.(post|get|put|patch)\s*\(\s*['"`]\/?(login|logout|register))/i,
    recommendation: "Replace manual auth route handlers with IdentityGenerator auth API."
  },
  {
    category: "password-manual",
    pattern: /(bcrypt|argon2|crypto\.pbkdf2|createHash\(|scrypt\()/i,
    recommendation: "Use IdentityGenerator password hash/verify and password policy service."
  },
  {
    category: "hashing-manual",
    pattern: /(jwt\.sign\(|jwt\.verify\(|jsonwebtoken|createHmac\()/i,
    recommendation: "Use IdentityGenerator token and JWT service."
  },
  {
    category: "auth-middleware-manual",
    pattern: /(authMiddleware|requireAuth|verifyToken|passport\.authenticate|authorize\()/i,
    recommendation: "Use IdentityGenerator authorization middleware/guard."
  },
  {
    category: "permission-manual",
    pattern: /(requirePermission|hasPermission|checkPermission|permissionGuard|rbac)/i,
    recommendation: "Use IdentityGenerator RBAC permission guard and permission service."
  },
  {
    category: "session-manual",
    pattern: /(express-session|cookie-session|rememberMe|logoutAllDevices|sessionStore|set-cookie)/i,
    recommendation: "Use IdentityGenerator session store, validator, and concurrent session controls."
  }
];

export interface IIdentityManualDetector {
  scan(project: ProjectInfo): Diagnostic[];
}

export class IdentityManualDetector implements IIdentityManualDetector {
  scan(project: ProjectInfo): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const sourceFile of project.sourceFiles) {
      if (!this.isScannable(sourceFile)) {
        continue;
      }

      let content = "";
      try {
        content = fs.readFileSync(sourceFile, "utf8");
      }
      catch {
        continue;
      }

      for (const identityPattern of IDENTITY_PATTERNS) {
        const match = content.match(identityPattern.pattern);
        if (!match || typeof match.index !== "number") {
          continue;
        }

        diagnostics.push({
          category: BuildErrorType.IDENTITY_MANUAL,
          code: "SATSET_IDENTITY_MANUAL",
          file: sourceFile,
          line: this.computeLine(content, match.index),
          message: `[identity-manual-detected:${identityPattern.category}] ${identityPattern.recommendation}`,
          raw: match[0],
          source: "pnpm"
        });
      }
    }

    return this.deduplicate(diagnostics);
  }

  private isScannable(filePath: string): boolean {
    const normalized = filePath.toLowerCase();
    const toolsFragment = `${path.sep}tools${path.sep}`.toLowerCase();
    if (normalized.includes(toolsFragment)) {
      return false;
    }

    return /\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(filePath);
  }

  private computeLine(content: string, index: number): number {
    return content.slice(0, index).split(/\r?\n/).length;
  }

  private deduplicate(diagnostics: readonly Diagnostic[]): Diagnostic[] {
    const seen = new Set<string>();
    const unique: Diagnostic[] = [];

    for (const diagnostic of diagnostics) {
      const key = `${diagnostic.file}|${diagnostic.code}|${diagnostic.message}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      unique.push(diagnostic);
    }

    return unique;
  }
}
