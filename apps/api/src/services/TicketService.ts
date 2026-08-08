import type { CreateTicketDto, UpdateTicketDto } from "../dto/TicketDto.js";
import { TicketRepository } from "../repositories/TicketRepository.js";
import { TicketValidator } from "../validators/TicketValidator.js";

export class TicketServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "TicketServiceError";
  }
}

export class TicketService {
  constructor(
    private readonly repository: TicketRepository,
    private readonly validator: TicketValidator
  ) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new TicketServiceError("Ticket not found", 404);
    }
    return entity;
  }

  async create(data: unknown) {
    const payload = this.validator.validateCreate(data);
    this.validateDateRange(payload.validFrom, payload.validUntil);

    const existing = await this.repository.findByCode(payload.code);
    if (existing) {
      throw new TicketServiceError("Ticket code already exists", 409);
    }

    return this.repository.create(payload);
  }

  async update(id: string, data: unknown) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new TicketServiceError("Ticket not found", 404);
    }

    const payload = this.validator.validateUpdate(data);
    this.validateUpdateDateRange(existing, payload);

    if (payload.code && payload.code.toLowerCase() !== existing.code.toLowerCase()) {
      const duplicate = await this.repository.findByCode(payload.code);
      if (duplicate) {
        throw new TicketServiceError("Ticket code already exists", 409);
      }
    }

    const updated = await this.repository.update(id, payload);
    if (!updated) {
      throw new TicketServiceError("Ticket not found", 404);
    }

    return updated;
  }

  async delete(id: string) {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new TicketServiceError("Ticket not found", 404);
    }
  }

  private validateDateRange(validFrom: string, validUntil: string): void {
    if (new Date(validFrom).getTime() > new Date(validUntil).getTime()) {
      throw new TicketServiceError("validFrom cannot be after validUntil", 400);
    }
  }

  private validateUpdateDateRange(existing: { validFrom: string; validUntil: string }, payload: UpdateTicketDto): void {
    const nextFrom = payload.validFrom ?? existing.validFrom;
    const nextUntil = payload.validUntil ?? existing.validUntil;
    this.validateDateRange(nextFrom, nextUntil);
  }
}
