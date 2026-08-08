const basePath = "/ticket";

async function toJson(response) {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

async function getAll() {
  const response = await fetch(basePath, {
    method: "GET"
  });
  return toJson(response);
}

async function getById(id) {
  const response = await fetch(`${basePath}/${id}`, {
    method: "GET"
  });
  return toJson(response);
}

async function create(payload) {
  const response = await fetch(basePath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return toJson(response);
}

async function update(id, payload) {
  const response = await fetch(`${basePath}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return toJson(response);
}

async function remove(id) {
  const response = await fetch(`${basePath}/${id}`, {
    method: "DELETE"
  });
  return toJson(response);
}

export const ticketApi = {
  getAll,
  getById,
  create,
  update,
  delete: remove
};
