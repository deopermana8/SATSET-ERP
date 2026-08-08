import { ReservationService, ReservationServiceError } from "../services/ReservationService.js";

export interface ReservationRequest {
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface ReservationResponse {
  status: (code: number) => ReservationResponse;
  json: (payload: unknown) => void;
  sendStatus: (code: number) => void;
}

export class ReservationController {
  constructor(
    private readonly service: ReservationService
  ) {}

  async getAll(_req: ReservationRequest, res: ReservationResponse) {
    try {
      const rows = await this.service.findAll();
      res.status(200).json(rows);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getById(req: ReservationRequest, res: ReservationResponse) {
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

  async create(req: ReservationRequest, res: ReservationResponse) {
    try {
      const created = await this.service.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async pay(req: ReservationRequest, res: ReservationResponse) {
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

  async confirm(req: ReservationRequest, res: ReservationResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const updated = await this.service.confirm(id);
      res.status(200).json(updated);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async checkIn(req: ReservationRequest, res: ReservationResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const result = await this.service.checkIn(id);
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async cancel(req: ReservationRequest, res: ReservationResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const updated = await this.service.cancel(id);
      res.status(200).json(updated);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getQr(req: ReservationRequest, res: ReservationResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const qr = await this.service.getQr(id);
      res.status(200).json(qr);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getReport(_req: ReservationRequest, res: ReservationResponse) {
    try {
      const report = await this.service.getReport();
      res.status(200).json(report);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: ReservationResponse): void {
    if (error instanceof ReservationServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
