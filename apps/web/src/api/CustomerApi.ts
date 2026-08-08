import type { CreateCustomerDto, UpdateCustomerDto, CustomerItem, CustomerListResponse } from "../dto/CustomerDto";

const basePath = "/api/customer";

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

async function getAll(): Promise<CustomerListResponse> {
  const response = await fetch(basePath, {
    method: "GET"
  });
  return toJson<CustomerListResponse>(response);
}

async function getById(id: string): Promise<CustomerItem> {
  const response = await fetch(`${basePath}/${id}`, {
    method: "GET"
  });
  return toJson<CustomerItem>(response);
}

async function create(payload: CreateCustomerDto): Promise<CustomerItem> {
  const response = await fetch(basePath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return toJson<CustomerItem>(response);
}

async function update(id: string, payload: UpdateCustomerDto): Promise<CustomerItem> {
  const response = await fetch(`${basePath}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return toJson<CustomerItem>(response);
}

async function remove(id: string): Promise<null> {
  const response = await fetch(`${basePath}/${id}`, {
    method: "DELETE"
  });
  return toJson<null>(response);
}

export const customerApi = {
  getAll,
  getById,
  create,
  update,
  delete: remove
};
