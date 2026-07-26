import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface AuthenticationOutput {
  providers: string[];
  roles: string[];
  strategy: string[];
}

export class AuthenticationGenerator implements IEngine {
  public readonly name = "AuthenticationGenerator";

  async run(context: Context): Promise<void> {
    const auth = context.metadata as Record<string, unknown> | undefined;
    const providers = Array.isArray(auth?.authentication) ? auth.authentication.map(String) : ["jwt", "rbac"];
    const pipeline = new ArtifactPipeline(context.projectRoot);

    await pipeline.run(context, [{
      id: "jwt-auth",
      name: "jwt-auth",
      templatePath: path.join(context.projectRoot, "templates", "jwt.ts.tpl"),
      outputPath: path.join(context.projectRoot, "src", "auth", "jwt.ts"),
      variables: {
        providers: providers.join(", "),
      },
    }]);

    context.metadata = {
      ...context.metadata,
      authentication: {
        providers,
        roles: ["admin", "member"],
        strategy: ["jwt", "rbac"],
      },
    } as typeof context.metadata & { authentication?: AuthenticationOutput };
  }
}
