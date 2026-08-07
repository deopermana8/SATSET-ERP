import type { MasterEntityConfig, MasterEntityKeyGeneric } from "./types.js";

export type EntityRegistry = {
  register: <TRecord extends Record<string, unknown>>(config: MasterEntityConfig<TRecord>) => void;
  registerMany: (configs: MasterEntityConfig[]) => void;
  has: (key: MasterEntityKeyGeneric) => boolean;
  get: <TRecord extends Record<string, unknown>>(key: MasterEntityKeyGeneric) => MasterEntityConfig<TRecord>;
  list: () => MasterEntityConfig[];
};

export function createEntityRegistry(initialConfigs: MasterEntityConfig[] = []): EntityRegistry {
  const map = new Map<MasterEntityKeyGeneric, MasterEntityConfig>();
  const ordered: MasterEntityConfig[] = [];

  const register = <TRecord extends Record<string, unknown>>(config: MasterEntityConfig<TRecord>): void => {
    if (map.has(config.key)) {
      throw new Error(`Entity ${config.key} sudah terdaftar`);
    }
    const normalized = Object.freeze({ ...config }) as MasterEntityConfig;
    map.set(config.key, normalized);
    ordered.push(normalized);
  };

  const registerMany = (configs: MasterEntityConfig[]): void => {
    for (const config of configs) {
      register(config);
    }
  };

  const has = (key: MasterEntityKeyGeneric): boolean => map.has(key);

  const get = <TRecord extends Record<string, unknown>>(key: MasterEntityKeyGeneric): MasterEntityConfig<TRecord> => {
    const config = map.get(key);
    if (!config) {
      throw new Error(`Entity ${key} tidak ditemukan`);
    }
    return config as MasterEntityConfig<TRecord>;
  };

  const list = (): MasterEntityConfig[] => ordered.slice();

  registerMany(initialConfigs);

  return { register, registerMany, has, get, list };
}
