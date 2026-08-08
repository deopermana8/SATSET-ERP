import { MenuItemService, MenuItemServiceError } from "../services/MenuItemService.js";

export interface MenuItemRequest {
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface MenuItemResponse {
  status: (code: number) => MenuItemResponse;
  json: (payload: unknown) => void;
  sendStatus: (code: number) => void;
}

export class MenuItemController {
  constructor(
    private readonly service: MenuItemService
  ) {}

  async getAll(_req: MenuItemRequest, res: MenuItemResponse) {
    try {
      const rows = await this.service.findAll();
      res.status(200).json(rows);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async create(req: MenuItemRequest, res: MenuItemResponse) {
    try {
      const created = await this.service.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async update(req: MenuItemRequest, res: MenuItemResponse) {
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

  async delete(req: MenuItemRequest, res: MenuItemResponse) {
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

  private handleError(error: unknown, res: MenuItemResponse): void {
    if (error instanceof MenuItemServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
