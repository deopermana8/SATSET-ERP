import type { CreateSupplierDto, UpdateSupplierDto } from "../dto/SupplierDto.js";
import { SupplierService } from "../services/SupplierService.js";

export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  async list() {
    return this.supplierService.list();
  }

  async get(id: string) {
    return this.supplierService.get(id);
  }

  async create(payload: CreateSupplierDto) {
    return this.supplierService.create(payload);
  }

  async update(id: string, payload: UpdateSupplierDto) {
    return this.supplierService.update(id, payload);
  }

  async remove(id: string) {
    await this.supplierService.remove(id);
    return { success: true };
  }
}
