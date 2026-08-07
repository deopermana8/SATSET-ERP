import { createServer } from "node:http";

const port = Number(process.env.ADMIN_PORT ?? 3000);
const apiUrl = process.env.API_URL ?? "http://127.0.0.1:3001";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{names.module.title}} Admin</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; background: linear-gradient(135deg, #10131f, #1b2338 55%, #09111f); color: #e7edf7; }
      main { max-width: 1120px; margin: 0 auto; padding: 32px; }
      .hero, .panel { background: rgba(10, 16, 30, 0.7); border: 1px solid rgba(148, 163, 184, 0.18); border-radius: 20px; padding: 24px; box-shadow: 0 24px 80px rgba(0,0,0,.28); }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 20px; }
      .card { padding: 18px; border-radius: 16px; background: rgba(255,255,255,0.04); }
      input, button { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(148,163,184,.18); background: rgba(15,23,42,.7); color: inherit; }
      button { background: linear-gradient(135deg, #d97706, #f59e0b); border: 0; font-weight: 700; margin-top: 10px; }
      table { width: 100%; border-collapse: collapse; margin-top: 14px; }
      th, td { text-align: left; padding: 10px; border-bottom: 1px solid rgba(148,163,184,.16); }
      .pill { display: inline-block; padding: 6px 10px; border-radius: 999px; background: rgba(245,158,11,.18); color: #fbbf24; }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <span class="pill">Admin Workspace</span>
        <h1>{{names.module.title}} Admin</h1>
        <p>Bootstrap host application connected to <strong>${apiUrl}</strong>.</p>
      </section>
      <div class="grid">
        <section class="panel">
          <h2>Login</h2>
          <input placeholder="Email" value="admin@satset.local" />
          <input placeholder="Password" value="password" type="password" />
          <button type="button">Sign in</button>
        </section>
        <section class="panel">
          <h2>Dashboard</h2>
          <div class="card">Revenue: Rp 125.000.000</div>
          <div class="card">Reservations: 128</div>
          <div class="card">Tickets sold: 2.304</div>
        </section>
        <section class="panel">
          <h2>CRUD</h2>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Status</th></tr></thead>
            <tbody><tr><td>001</td><td>Destinasi Utama</td><td>Active</td></tr></tbody>
          </table>
        </section>
      </div>
    </main>
  </body>
</html>`;

createServer((_, response) => {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(html);
}).listen(port, () => {
  console.log(`[admin] listening on http://127.0.0.1:${port}`);
});