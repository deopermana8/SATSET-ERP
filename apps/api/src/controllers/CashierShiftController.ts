import { CashierShiftService, CashierShiftServiceError } from "../services/CashierShiftService.js";

export interface CashierShiftRequest {
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface CashierShiftResponse {
  status: (code: number) => CashierShiftResponse;
  json: (payload: unknown) => void;
  sendStatus: (code: number) => void;
}

export class CashierShiftController {
  constructor(
    private readonly service: CashierShiftService
  ) {}

  async open(req: CashierShiftRequest, res: CashierShiftResponse) {
    try {
      const created = await this.service.openShift(req.body);
      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async close(req: CashierShiftRequest, res: CashierShiftResponse) {
    try {
      const closed = await this.service.closeShift(req.body);
      res.status(200).json(closed);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async current(_req: CashierShiftRequest, res: CashierShiftResponse) {
    try {
      const current = await this.service.getCurrentShift();
      res.status(200).json(current);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async summary(_req: CashierShiftRequest, res: CashierShiftResponse) {
    try {
      const summary = await this.service.summary();
      res.status(200).json(summary);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async history(_req: CashierShiftRequest, res: CashierShiftResponse) {
    try {
      const history = await this.service.history();
      res.status(200).json(history);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: CashierShiftResponse): void {
    if (error instanceof CashierShiftServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
