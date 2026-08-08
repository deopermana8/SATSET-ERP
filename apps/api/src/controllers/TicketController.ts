import { TicketService, TicketServiceError } from "../services/TicketService.js";

export interface TicketRequest {
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface TicketResponse {
  status: (code: number) => TicketResponse;
  json: (payload: unknown) => void;
  sendStatus: (code: number) => void;
}

export class TicketController {
  constructor(
    private readonly service: TicketService
  ) {}

  async getAll(_req: TicketRequest, res: TicketResponse) {
    try {
      const data = await this.service.findAll();
      res.status(200).json(data);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getById(req: TicketRequest, res: TicketResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const data = await this.service.findById(id);
      res.status(200).json(data);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAvailable(_req: TicketRequest, res: TicketResponse) {
    try {
      const data = await this.service.findAll();
      const now = new Date().getTime();
      const available = data.filter((item) => (
        item.active
        && item.quota > 0
        && new Date(item.validFrom).getTime() <= now
        && new Date(item.validUntil).getTime() >= now
      ));
      res.status(200).json(available);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async create(req: TicketRequest, res: TicketResponse) {
    try {
      const data = await this.service.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async update(req: TicketRequest, res: TicketResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const data = await this.service.update(id, req.body);
      res.status(200).json(data);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async delete(req: TicketRequest, res: TicketResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      await this.service.delete(id);
      res.sendStatus(204);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: TicketResponse): void {
    if (error instanceof TicketServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
