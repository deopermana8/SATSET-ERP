import type { MasterField, MasterRecord } from "../crud/types.js";
import { validateMasterRecord } from "../validators/masterValidator.js";

export function validateMasterPayload(payload: Partial<MasterRecord>, fields: MasterField[]) {
  return validateMasterRecord(payload, fields);
}
