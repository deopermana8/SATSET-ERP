import { CustomerService } from "../services/CustomerService.js";
import { CustomerServiceError } from "../services/CustomerService.js";

export interface CustomerRequest {
  params?: { id?: string };
  body?: unknown;
}

export interface CustomerResponse {
  status(code: number): CustomerResponse;
  json(payload: unknown): void;
  sendStatus(code: number): void;
}

export class CustomerController {
  constructor(
    private readonly service: CustomerService
  ){}

  async getAll(_req: CustomerRequest, res: CustomerResponse) {
    try {
      const items = await this.service.findAll();
      res.status(200).json({
        data: items,
        total: items.length
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getById(req: CustomerRequest, res: CustomerResponse) {
    try {
      const id = req.params?.id;
      if (!id) {
        res.status(400).json({ error: "Customer id is required" });
        return;
      }

      const item = await this.service.findById(id);
      res.status(200).json(item);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async create(req: CustomerRequest, res: CustomerResponse) {
    try {
      const created = await this.service.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async update(req: CustomerRequest, res: CustomerResponse) {
    try {
      const id = req.params?.id;
      if (!id) {
        res.status(400).json({ error: "Customer id is required" });
        return;
      }

      const updated = await this.service.update(id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async delete(req: CustomerRequest, res: CustomerResponse) {
    try {
      const id = req.params?.id;
      if (!id) {
        res.status(400).json({ error: "Customer id is required" });
        return;
      }

      await this.service.delete(id);
      res.sendStatus(204);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: CustomerResponse): void {
    if (error instanceof CustomerServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
