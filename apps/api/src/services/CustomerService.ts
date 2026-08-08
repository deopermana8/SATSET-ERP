import { CustomerRepository } from "../repositories/CustomerRepository.js";
import type { CreateCustomerDto, UpdateCustomerDto } from "../dto/CustomerDto.js";
import { CustomerValidator } from "../validators/CustomerValidator.js";

export class CustomerServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "CustomerServiceError";
  }
}

export class CustomerService {
  constructor(
    private readonly repository: CustomerRepository,
    private readonly validator: CustomerValidator = new CustomerValidator()
  ){}

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new CustomerServiceError("Customer not found", 404);
    }
    return found;
  }

  async create(data: unknown) {
    const payload: CreateCustomerDto = this.validator.validateCreate(data);

    const existingCode = await this.repository.findByCode(payload.code);
    if (existingCode) {
      throw new CustomerServiceError("Customer code already exists", 409);
    }

    const existingEmail = await this.repository.findByEmail(payload.email);
    if (existingEmail) {
      throw new CustomerServiceError("Customer email already exists", 409);
    }

    return this.repository.create(payload);
  }

  async update(id: string, data: unknown) {
    const payload: UpdateCustomerDto = this.validator.validateUpdate(data);

    const current = await this.repository.findById(id);
    if (!current) {
      throw new CustomerServiceError("Customer not found", 404);
    }

    if (payload.code && payload.code.toLowerCase() !== current.code.toLowerCase()) {
      const duplicatedCode = await this.repository.findByCode(payload.code);
      if (duplicatedCode && duplicatedCode.id !== id) {
        throw new CustomerServiceError("Customer code already exists", 409);
      }
    }

    if (payload.email && payload.email.toLowerCase() !== current.email.toLowerCase()) {
      const duplicatedEmail = await this.repository.findByEmail(payload.email);
      if (duplicatedEmail && duplicatedEmail.id !== id) {
        throw new CustomerServiceError("Customer email already exists", 409);
      }
    }

    const updated = await this.repository.update(id, payload);
    if (!updated) {
      throw new CustomerServiceError("Customer not found", 404);
    }

    return updated;
  }

  async delete(id: string) {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new CustomerServiceError("Customer not found", 404);
    }
  }
}
