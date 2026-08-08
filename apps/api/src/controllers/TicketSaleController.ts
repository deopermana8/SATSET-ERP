import { TicketSaleService, TicketSaleServiceError } from "../services/TicketSaleService.js";

export interface TicketSaleRequest {
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface TicketSaleResponse {
  status: (code: number) => TicketSaleResponse;
  json: (payload: unknown) => void;
  sendStatus: (code: number) => void;
}

export class TicketSaleController {
  constructor(
    private readonly service: TicketSaleService
  ) {}

  async getAll(_req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const data = await this.service.findAll();
      res.status(200).json(data);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getById(req: TicketSaleRequest, res: TicketSaleResponse) {
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

  async create(req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const created = await this.service.createSale(req.body);
      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async pay(req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }

      const paid = await this.service.markPaid(id, req.body);
      res.status(200).json(paid);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async print(req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const printed = await this.service.markPrinted(id);
      res.status(200).json(printed);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getQr(req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const qr = await this.service.getQrPayload(id);
      res.status(200).json(qr);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async checkIn(req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const checkedIn = await this.service.checkIn(req.body);
      res.status(200).json(checkedIn);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async voidTicket(req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const sale = await this.service.voidTicket(id);
      res.status(200).json(sale);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getTicket(req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const ticket = await this.service.getTicketView(id);
      res.status(200).json(ticket);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getSummary(_req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const summary = await this.service.getDashboardSummary();
      res.status(200).json(summary);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getReport(_req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const report = await this.service.getReports();
      res.status(200).json(report);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async update(req: TicketSaleRequest, res: TicketSaleResponse) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
      }
      const updated = await this.service.update(id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async delete(req: TicketSaleRequest, res: TicketSaleResponse) {
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

  private handleError(error: unknown, res: TicketSaleResponse): void {
    if (error instanceof TicketSaleServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
