import { MenuCategoryService, MenuCategoryServiceError } from "../services/MenuCategoryService.js";

export interface MenuCategoryRequest {
  params: Record<string, string | undefined>;
  body?: unknown;
}

export interface MenuCategoryResponse {
  status: (code: number) => MenuCategoryResponse;
  json: (payload: unknown) => void;
  sendStatus: (code: number) => void;
}

export class MenuCategoryController {
  constructor(
    private readonly service: MenuCategoryService
  ) {}

  async getAll(_req: MenuCategoryRequest, res: MenuCategoryResponse) {
    try {
      const rows = await this.service.findAll();
      res.status(200).json(rows);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async create(req: MenuCategoryRequest, res: MenuCategoryResponse) {
    try {
      const created = await this.service.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: MenuCategoryResponse): void {
    if (error instanceof MenuCategoryServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
