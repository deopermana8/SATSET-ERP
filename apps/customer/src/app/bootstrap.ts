import { createServer } from "node:http";
import { renderCustomerHtml } from "./app.js";

export function bootstrapCustomerServer(): void {
  const port = Number(process.env.CUSTOMER_PORT ?? 3200);
  const apiUrl = process.env.API_URL ?? "http://127.0.0.1:3001";

  createServer((request, response) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
    if (url.pathname === "/") {
      response.writeHead(302, { location: "/customer" });
      response.end();
      return;
    }

    if (url.pathname.startsWith("/customer")) {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(renderCustomerHtml(apiUrl));
      return;
    }

    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not Found");
  }).listen(port, () => {
    console.log(`[customer] listening on http://127.0.0.1:${port}/customer`);
  });
}
