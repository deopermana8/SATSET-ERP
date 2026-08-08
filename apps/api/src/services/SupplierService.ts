import type { CreateSupplierDto, SupplierDto, UpdateSupplierDto } from "../dto/SupplierDto.js";
import { SupplierRepository } from "../repositories/SupplierRepository.js";

export class SupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async list(): Promise<SupplierDto[]> {
    return this.supplierRepository.findAll();
  }

  async get(id: string): Promise<SupplierDto> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    return supplier;
  }

  async create(data: CreateSupplierDto): Promise<SupplierDto> {
    if (!data.code.trim()) {
      throw new Error("Supplier code is required");
    }
    if (!data.name.trim()) {
      throw new Error("Supplier name is required");
    }

    const existing = await this.supplierRepository.findByCode(data.code.trim());
    if (existing) {
      throw new Error("Supplier code already exists");
    }

    return this.supplierRepository.create({
      ...data,
      code: data.code.trim(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      address: data.address.trim()
    });
  }

  async update(id: string, data: UpdateSupplierDto): Promise<SupplierDto> {
    if (data.code && data.code.trim()) {
      const existing = await this.supplierRepository.findByCode(data.code.trim());
      if (existing && existing.id !== id) {
        throw new Error("Supplier code already exists");
      }
    }

    const updated = await this.supplierRepository.update(id, {
      ...data,
      code: data.code?.trim(),
      name: data.name?.trim(),
      phone: data.phone?.trim(),
      email: data.email?.trim(),
      address: data.address?.trim()
    });

    if (!updated) {
      throw new Error("Supplier not found");
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.supplierRepository.delete(id);
    if (!deleted) {
      throw new Error("Supplier not found");
    }
  }
}
