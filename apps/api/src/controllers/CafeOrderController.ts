import { CafeOrderService, CafeOrderServiceError } from "../services/CafeOrderService.js";

export interface CafeOrderRequest {
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface CafeOrderResponse {
  status: (code: number) => CafeOrderResponse;
  json: (payload: unknown) => void;
  sendStatus: (code: number) => void;
}

export class CafeOrderController {
  constructor(
    private readonly service: CafeOrderService
  ) {}

  async getAll(_req: CafeOrderRequest, res: CafeOrderResponse) {
    try {
      const rows = await this.service.findAll();
      res.status(200).json(rows);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getById(req: CafeOrderRequest, res: CafeOrderResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const row = await this.service.findById(id);
      res.status(200).json(row);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async create(req: CafeOrderRequest, res: CafeOrderResponse) {
    try {
      const created = await this.service.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async pay(req: CafeOrderRequest, res: CafeOrderResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const updated = await this.service.pay(id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async print(req: CafeOrderRequest, res: CafeOrderResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const printed = await this.service.print(id);
      res.status(200).json(printed);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async void(req: CafeOrderRequest, res: CafeOrderResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const updated = await this.service.void(id);
      res.status(200).json(updated);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async summary(_req: CafeOrderRequest, res: CafeOrderResponse) {
    try {
      const summary = await this.service.summary();
      res.status(200).json(summary);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async report(_req: CafeOrderRequest, res: CafeOrderResponse) {
    try {
      const report = await this.service.report();
      res.status(200).json(report);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: CafeOrderResponse): void {
    if (error instanceof CafeOrderServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
