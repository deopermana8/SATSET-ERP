import fs from "node:fs";
import path from "node:path";

export interface AuthGenerateResult {
  written: string[];
  errors: string[];
}

const JWT_UTIL = `import crypto from "node:crypto";

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

const SECRET = process.env["JWT_SECRET"] ?? "change-me-in-production";
const EXPIRY_SECONDS = 60 * 60 * 24; // 24h

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + EXPIRY_SECONDS;
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify({ ...payload, iat, exp }));
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(\`\${header}.\${body}\`)
    .digest("base64url");
  return \`\${header}.\${body}.\${sig}\`;
}

export function verifyToken(token: string): JwtPayload {
  const [header, body, sig] = token.split(".");
  if (!header || !body || !sig) throw new Error("invalid token");
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(\`\${header}.\${body}\`)
    .digest("base64url");
  if (sig !== expected) throw new Error("invalid signature");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as JwtPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error("token expired");
  return payload;
}
`;

const AUTH_MIDDLEWARE = `import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const payload = verifyToken(auth.slice(7));
    (req as Request & { user?: unknown }).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "invalid token" });
  }
}
`;

const AUTH_ROUTER = `import { Router } from "express";
import crypto from "node:crypto";
import { signToken } from "../lib/jwt.js";

const router = Router();

// In-memory user store (replace with DB)
const users: Map<string, { id: string; email: string; passwordHash: string }> = new Map();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// POST /auth/register
router.post("/register", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  if (users.has(email)) {
    return res.status(409).json({ error: "email already registered" });
  }
  const id = crypto.randomUUID();
  users.set(email, { id, email, passwordHash: hashPassword(password) });
  return res.status(201).json({ id, email });
});

// POST /auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  const user = users.get(email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const token = signToken({ sub: user.id, email: user.email });
  return res.json({ token });
});

export default router;
`;

export class AuthGenerator {
  generate(outputDir: string): AuthGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const dirs = [
      path.join(outputDir, "src", "lib"),
      path.join(outputDir, "src", "middleware"),
      path.join(outputDir, "src", "routes"),
    ];

    for (const dir of dirs) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        errors.push(`failed to create ${dir}: ${err instanceof Error ? err.message : String(err)}`);
        return { written, errors };
      }
    }

    const files: Record<string, string> = {
      "src/lib/jwt.ts": JWT_UTIL,
      "src/middleware/requireAuth.ts": AUTH_MIDDLEWARE,
      "src/routes/auth.ts": AUTH_ROUTER,
    };

    for (const [filePath, content] of Object.entries(files)) {
      const target = path.join(outputDir, filePath);
      try {
        fs.writeFileSync(target, content, "utf8");
        written.push(target);
      } catch (err) {
        errors.push(`failed to write ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { written, errors };
  }
}
