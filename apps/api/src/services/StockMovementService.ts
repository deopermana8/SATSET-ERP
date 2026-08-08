import type { StockMovementQueryDto } from "../dto/StockMovementQueryDto.js";
import type { StockMovementDto, StockMovementType } from "../dto/StockMovementDto.js";
import { StockMovementRepository } from "../repositories/StockMovementRepository.js";
import { StockMovementValidator } from "../validators/StockMovementValidator.js";

export class StockMovementService {
  constructor(
    private readonly stockMovementRepository: StockMovementRepository,
    private readonly validator: StockMovementValidator = new StockMovementValidator()
  ) {}

  async list(): Promise<StockMovementDto[]> {
    return this.stockMovementRepository.findAll();
  }

  async listByQuery(input: Record<string, string | undefined>): Promise<StockMovementDto[]> {
    const query: StockMovementQueryDto = this.validator.validateQuery(input);
    return this.stockMovementRepository.findByQuery(query);
  }

  async create(input: {
    inventoryId: string;
    movementType: StockMovementType;
    qty: number;
    balance: number;
    reference: string;
  }): Promise<StockMovementDto> {
    return this.stockMovementRepository.create(input);
  }
}
