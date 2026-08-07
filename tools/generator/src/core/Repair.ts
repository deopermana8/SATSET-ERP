import { RepairReport } from "../sdk/contracts.js";
import { AutoFixBridge } from "./AutoFixBridge.js";
import { Doctor, DoctorContext } from "./Doctor.js";

export interface RepairContext extends DoctorContext {
  build: () => Promise<boolean>;
}

export interface IRepair {
  run(context: RepairContext): Promise<RepairReport>;
}

export class Repair implements IRepair {
  private readonly autoFixBridge = new AutoFixBridge();
  private readonly doctor = new Doctor();

  async run(context: RepairContext): Promise<RepairReport> {
    const doctorReport = await this.doctor.run(context);
    let attempts = 0;
    let ok = doctorReport.ok;
    let buildStatus = "not-run";

    while (attempts < 3) {
      attempts += 1;
      await this.autoFixBridge.run({
        blueprint: {
          api: [],
          dashboard: { widgets: [] },
          description: "repair",
          entity: "Repair",
          entities: [{ name: "Repair" }],
          fields: [],
          menu: [],
          metadata: {},
          mobile: { offline: false, screen: "Repair" },
          module: "Repair",
          permissions: [],
          relations: [],
          reports: [],
          scanner: { provider: "repair", schedule: "manual" },
          seed: [],
          sidebar: { items: [], title: "Repair" },
          validation: [],
          workflow: []
        },
        command: {
          arguments: [],
          name: "repair",
          target: "module",
          verb: "repair"
        },
        currentEntity: { name: "Repair" },
        ensureBlueprintValue: () => undefined,
        generateFromTasks: async () => [],
        generatedAt: new Date().toISOString(),
        generatorRoot: context.generatorRoot,
        getBlueprintValue: () => undefined,
        log: () => undefined,
        names: {
          entity: { camel: "repair", kebab: "repair", pascal: "Repair", pluralCamel: "repairs", pluralKebab: "repairs", pluralPascal: "Repairs", raw: "Repair", singular: "Repair", snake: "repair", title: "Repair" },
          module: { camel: "repair", kebab: "repair", pascal: "Repair", pluralCamel: "repairs", pluralKebab: "repairs", pluralPascal: "Repairs", raw: "Repair", singular: "Repair", snake: "repair", title: "Repair" }
        },
        outputRoot: context.generatorRoot,
        projectRoot: context.projectRoot
      } as never);
      ok = await context.build();
      buildStatus = ok ? "clean" : "dirty";
      if (ok) {
        break;
      }
    }

    return {
      attempts,
      buildStatus,
      doctor: doctorReport,
      ok
    };
  }
}
