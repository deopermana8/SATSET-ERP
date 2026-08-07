import { FileSystem } from "../utils/FileSystem.js";
import { getFastGlob, path } from "../utils/Node.js";

export interface DomainPackDefinition {
  domain: string;
  filePath: string;
}

export interface IDomainPackRegistry {
  discover(generatorRoot: string): Promise<DomainPackDefinition[]>;
  findByRequirement(requirement: string, packs: readonly DomainPackDefinition[]): DomainPackDefinition | undefined;
}

export class DomainPackRegistry implements IDomainPackRegistry {
  private readonly fileSystem = new FileSystem();

  async discover(generatorRoot: string): Promise<DomainPackDefinition[]> {
    const root = path.join(generatorRoot, "blueprints", "domain-packs");
    if (!this.fileSystem.exists(root)) {
      return [];
    }

    const fastGlob = getFastGlob();
    const files = await fastGlob(["*.yaml"], {
      absolute: true,
      cwd: root,
      dot: false,
      ignore: [],
      onlyFiles: true,
      suppressErrors: true,
      unique: true
    });

    return files.map((filePath) => ({
      domain: path.basename(filePath, ".yaml").toLowerCase(),
      filePath
    }));
  }

  findByRequirement(requirement: string, packs: readonly DomainPackDefinition[]): DomainPackDefinition | undefined {
    const lowered = requirement.toLowerCase();
    return packs.find((pack) => lowered.includes(pack.domain));
  }
}
