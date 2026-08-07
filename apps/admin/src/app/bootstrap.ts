import { createServer } from "node:http";
import { renderAdminHtml } from "./app.js";

export function bootstrapAdminServer(): void {
  const port = Number(process.env.ADMIN_PORT ?? 3000);
  const apiUrl = process.env.API_URL ?? "http://127.0.0.1:3001";

  createServer((_, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(renderAdminHtml(apiUrl));
  }).listen(port, () => {
    console.log(`[admin] listening on http://127.0.0.1:${port}`);
  });
}
