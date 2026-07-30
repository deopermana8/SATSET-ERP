import fs from "node:fs";
import path from "node:path";
import { AuthGenerator } from "./AuthGenerator.js";

export interface FullAuthGenerateResult {
  written: string[];
  errors: string[];
}

const ROLE_PERMISSION = `export type Role = "admin" | "manager" | "user";

export const PERMISSIONS: Record<Role, string[]> = {
  admin: ["read", "write", "delete", "manage"],
  manager: ["read", "write"],
  user: ["read"],
};

export function hasPermission(role: Role, permission: string): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}
`;

const REFRESH_TOKEN = `import crypto from "node:crypto";
import { signToken } from "./jwt.js";

const refreshTokenStore = new Map<string, { userId: string; email: string; expiresAt: number }>();

export function issueRefreshToken(userId: string, email: string): string {
  const token = crypto.randomUUID();
  refreshTokenStore.set(token, { userId, email, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return token;
}

export function rotateRefreshToken(refreshToken: string): { accessToken: string; refreshToken: string } | null {
  const entry = refreshTokenStore.get(refreshToken);
  if (!entry || entry.expiresAt < Date.now()) {
    refreshTokenStore.delete(refreshToken);
    return null;
  }
  refreshTokenStore.delete(refreshToken);
  const newRefresh = issueRefreshToken(entry.userId, entry.email);
  const accessToken = signToken({ sub: entry.userId, email: entry.email });
  return { accessToken, refreshToken: newRefresh };
}

export function revokeRefreshToken(refreshToken: string): void {
  refreshTokenStore.delete(refreshToken);
}
`;

const GUARD = `import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";
import { hasPermission, type Role } from "../lib/roles.js";

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = req.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "unauthorized" }); return; }
    try {
      const payload = verifyToken(auth.slice(7));
      const userRole = (payload as Record<string, unknown>)["role"] as Role ?? "user";
      if (!roles.includes(userRole)) { res.status(403).json({ error: "forbidden" }); return; }
      (req as Request & { user?: unknown }).user = payload;
      next();
    } catch { res.status(401).json({ error: "invalid token" }); }
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = req.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "unauthorized" }); return; }
    try {
      const payload = verifyToken(auth.slice(7));
      const role = ((payload as Record<string, unknown>)["role"] as Role) ?? "user";
      if (!hasPermission(role, permission)) { res.status(403).json({ error: "forbidden" }); return; }
      (req as Request & { user?: unknown }).user = payload;
      next();
    } catch { res.status(401).json({ error: "invalid token" }); }
  };
}
`;

const REFRESH_ROUTE_ADDITION = `import { Router } from "express";
import { rotateRefreshToken, revokeRefreshToken, issueRefreshToken } from "../lib/refreshToken.js";

const refreshRouter = Router();

refreshRouter.post("/refresh", (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return res.status(400).json({ error: "refreshToken required" });
  const result = rotateRefreshToken(refreshToken);
  if (!result) return res.status(401).json({ error: "invalid or expired refresh token" });
  return res.json(result);
});

refreshRouter.post("/logout", (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) revokeRefreshToken(refreshToken);
  return res.status(204).send();
});

export default refreshRouter;
`;

const REACT_LOGIN_PAGE = `import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) { setError("Invalid credentials"); return; }
    const { token, refreshToken } = await res.json() as { token: string; refreshToken?: string };
    localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    window.location.href = "/";
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f1f5f9" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "2rem", borderRadius: 8, minWidth: 320, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>Login</h2>
        {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <input name="email" type="email" required style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4, border: "1px solid #cbd5e1", borderRadius: 4 }} />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label>Password</label>
          <input name="password" type="password" required style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4, border: "1px solid #cbd5e1", borderRadius: 4 }} />
        </div>
        <button type="submit" style={{ width: "100%", padding: "0.6rem", background: "#1e293b", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          Sign In
        </button>
      </form>
    </div>
  );
}
`;

const PROTECTED_ROUTE = `import { type ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }
  return <>{children}</>;
}
`;

export class FullAuthGenerator {
  generate(outputDir: string): FullAuthGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    // Reuse base AuthGenerator
    const base = new AuthGenerator();
    const baseResult = base.generate(outputDir);
    written.push(...baseResult.written);
    errors.push(...baseResult.errors);

    const dirs = [
      path.join(outputDir, "src", "lib"),
      path.join(outputDir, "src", "middleware"),
      path.join(outputDir, "src", "routes"),
      path.join(outputDir, "src", "pages"),
      path.join(outputDir, "src", "components"),
    ];

    for (const dir of dirs) {
      try { fs.mkdirSync(dir, { recursive: true }); } catch { /* already exists */ }
    }

    const files: Record<string, string> = {
      "src/lib/roles.ts": ROLE_PERMISSION,
      "src/lib/refreshToken.ts": REFRESH_TOKEN,
      "src/middleware/guard.ts": GUARD,
      "src/routes/refresh.ts": REFRESH_ROUTE_ADDITION,
      "src/pages/LoginPage.tsx": REACT_LOGIN_PAGE,
      "src/components/ProtectedRoute.tsx": PROTECTED_ROUTE,
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
