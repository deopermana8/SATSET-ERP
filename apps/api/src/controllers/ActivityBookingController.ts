import { ActivityBookingService, ActivityBookingServiceError } from "../services/ActivityBookingService.js";

export interface ActivityBookingRequest {
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface ActivityBookingResponse {
  status: (code: number) => ActivityBookingResponse;
  json: (payload: unknown) => void;
  sendStatus: (code: number) => void;
}

export class ActivityBookingController {
  constructor(
    private readonly service: ActivityBookingService
  ) {}

  async getAll(_req: ActivityBookingRequest, res: ActivityBookingResponse) {
    try {
      const rows = await this.service.findAll();
      res.status(200).json(rows);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async create(req: ActivityBookingRequest, res: ActivityBookingResponse) {
    try {
      const created = await this.service.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async pay(req: ActivityBookingRequest, res: ActivityBookingResponse) {
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

  async checkIn(req: ActivityBookingRequest, res: ActivityBookingResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const updated = await this.service.checkIn(id);
      res.status(200).json(updated);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async cancel(req: ActivityBookingRequest, res: ActivityBookingResponse) {
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

  async report(_req: ActivityBookingRequest, res: ActivityBookingResponse) {
    try {
      const report = await this.service.getReport();
      res.status(200).json(report);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async qr(req: ActivityBookingRequest, res: ActivityBookingResponse) {
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

  private handleError(error: unknown, res: ActivityBookingResponse): void {
    if (error instanceof ActivityBookingServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
