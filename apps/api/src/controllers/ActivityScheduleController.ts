import { ActivityScheduleService, ActivityScheduleServiceError } from "../services/ActivityScheduleService.js";

export interface ActivityScheduleRequest {
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface ActivityScheduleResponse {
  status: (code: number) => ActivityScheduleResponse;
  json: (payload: unknown) => void;
  sendStatus: (code: number) => void;
}

export class ActivityScheduleController {
  constructor(
    private readonly service: ActivityScheduleService
  ) {}

  async getAll(_req: ActivityScheduleRequest, res: ActivityScheduleResponse) {
    try {
      const rows = await this.service.findAll();
      res.status(200).json(rows);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async create(req: ActivityScheduleRequest, res: ActivityScheduleResponse) {
    try {
      const created = await this.service.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: ActivityScheduleResponse): void {
    if (error instanceof ActivityScheduleServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
