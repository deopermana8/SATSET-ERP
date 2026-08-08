import { ActivityService, ActivityServiceError } from "../services/ActivityService.js";

export interface ActivityRequest {
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface ActivityResponse {
  status: (code: number) => ActivityResponse;
  json: (payload: unknown) => void;
  sendStatus: (code: number) => void;
}

export class ActivityController {
  constructor(
    private readonly service: ActivityService
  ) {}

  async getAll(_req: ActivityRequest, res: ActivityResponse) {
    try {
      const rows = await this.service.findAll();
      res.status(200).json(rows);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async create(req: ActivityRequest, res: ActivityResponse) {
    try {
      const created = await this.service.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async update(req: ActivityRequest, res: ActivityResponse) {
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

  async delete(req: ActivityRequest, res: ActivityResponse) {
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

  private handleError(error: unknown, res: ActivityResponse): void {
    if (error instanceof ActivityServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
