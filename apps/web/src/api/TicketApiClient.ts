import type { CreateTicketDto, TicketItem, TicketListResponse, UpdateTicketDto } from "../dto/TicketDto";

async function toJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const fallback = `Request failed: ${response.status}`;
    try {
      const payload = await response.json() as { error?: string };
      throw new Error(payload.error ?? fallback);
    } catch {
      throw new Error(fallback);
    }
  }
  if (response.status === 204) {
    return null as T;
  }
  return response.json() as Promise<T>;
}

export function createTicketApiClient(basePath = "/api/ticket") {
  return {
    async getAll(): Promise<TicketListResponse> {
      const response = await fetch(basePath, { method: "GET" });
      return toJson<TicketListResponse>(response);
    },
    async getAvailable(): Promise<TicketListResponse> {
      const response = await fetch(`${basePath}/available`, { method: "GET" });
      return toJson<TicketListResponse>(response);
    },
    async getById(id: string): Promise<TicketItem> {
      const response = await fetch(`${basePath}/${id}`, { method: "GET" });
      return toJson<TicketItem>(response);
    },
    async create(payload: CreateTicketDto): Promise<TicketItem> {
      const response = await fetch(basePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return toJson<TicketItem>(response);
    },
    async update(id: string, payload: UpdateTicketDto): Promise<TicketItem> {
      const response = await fetch(`${basePath}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return toJson<TicketItem>(response);
    },
    async delete(id: string): Promise<null> {
      const response = await fetch(`${basePath}/${id}`, { method: "DELETE" });
      return toJson<null>(response);
    }
  };
}
