export function renderStatCard(): string {
  return `<div class="kpi-grid" id="kpi-grid" aria-live="polite">
    <button class="kpi-card" data-kpi="ticket-hari-ini" onclick="gt('list','ticketing')">
      <span class="kpi-lbl">Ticket Hari Ini</span><span class="kpi-val" id="kv-ticket-today">0</span><span class="kpi-trend t-up">+0%</span>
      <svg class="kpi-spark" viewBox="0 0 100 24" aria-hidden="true"><polyline points="2,18 18,13 34,16 50,8 66,10 82,6 98,4"/></svg>
      <span class="kpi-meta" id="kpi-updated-ticket">Pembaruan: -</span>
      <span class="kpi-ripple" aria-hidden="true"></span>
    </button>
    <button class="kpi-card" data-kpi="booking-hari-ini" onclick="gt('list','reservasi')">
      <span class="kpi-lbl">Booking Hari Ini</span><span class="kpi-val" id="kv-booking-today">0</span><span class="kpi-trend t-up">+0%</span>
      <svg class="kpi-spark" viewBox="0 0 100 24" aria-hidden="true"><polyline points="2,16 18,15 34,11 50,12 66,8 82,9 98,5"/></svg>
      <span class="kpi-meta" id="kpi-updated-booking">Pembaruan: -</span>
      <span class="kpi-ripple" aria-hidden="true"></span>
    </button>
    <button class="kpi-card" data-kpi="pendapatan-tiket" onclick="gt('list','ticketing')">
      <span class="kpi-lbl">Pendapatan Tiket</span><span class="kpi-val" id="kv-revenue-ticket">Rp0</span><span class="kpi-trend t-up">+0%</span>
      <svg class="kpi-spark" viewBox="0 0 100 24" aria-hidden="true"><polyline points="2,19 18,14 34,14 50,10 66,11 82,7 98,6"/></svg>
      <span class="kpi-meta" id="kpi-updated-ticket-revenue">Pembaruan: -</span>
      <span class="kpi-ripple" aria-hidden="true"></span>
    </button>
    <button class="kpi-card" data-kpi="pendapatan-cafe" onclick="gt('list','cafe')">
      <span class="kpi-lbl">Pendapatan Cafe</span><span class="kpi-val" id="kv-revenue-cafe">Rp0</span><span class="kpi-trend t-up">+0%</span>
      <svg class="kpi-spark" viewBox="0 0 100 24" aria-hidden="true"><polyline points="2,17 18,17 34,15 50,13 66,9 82,10 98,8"/></svg>
      <span class="kpi-meta" id="kpi-updated-cafe">Pembaruan: -</span>
      <span class="kpi-ripple" aria-hidden="true"></span>
    </button>
    <button class="kpi-card" data-kpi="pendapatan-outbound" onclick="gt('list','outbound')">
      <span class="kpi-lbl">Pendapatan Outbound</span><span class="kpi-val" id="kv-revenue-outbound">Rp0</span><span class="kpi-trend t-up">+0%</span>
      <svg class="kpi-spark" viewBox="0 0 100 24" aria-hidden="true"><polyline points="2,18 18,16 34,14 50,11 66,9 82,7 98,6"/></svg>
      <span class="kpi-meta" id="kpi-updated-outbound">Pembaruan: -</span>
      <span class="kpi-ripple" aria-hidden="true"></span>
    </button>
    <button class="kpi-card" data-kpi="saldo-kas" onclick="gt('list','finance')">
      <span class="kpi-lbl">Saldo Kas</span><span class="kpi-val" id="kv-cash-balance">Rp0</span><span class="kpi-trend t-up">+0%</span>
      <svg class="kpi-spark" viewBox="0 0 100 24" aria-hidden="true"><polyline points="2,18 18,14 34,13 50,12 66,9 82,8 98,7"/></svg>
      <span class="kpi-meta" id="kpi-updated-cash">Pembaruan: -</span>
      <span class="kpi-ripple" aria-hidden="true"></span>
    </button>
    <button class="kpi-card" data-kpi="saldo-bank" onclick="gt('list','finance')">
      <span class="kpi-lbl">Saldo Bank</span><span class="kpi-val" id="kv-bank-balance">Rp0</span><span class="kpi-trend t-up">+0%</span>
      <svg class="kpi-spark" viewBox="0 0 100 24" aria-hidden="true"><polyline points="2,19 18,16 34,15 50,12 66,11 82,8 98,7"/></svg>
      <span class="kpi-meta" id="kpi-updated-bank">Pembaruan: -</span>
      <span class="kpi-ripple" aria-hidden="true"></span>
    </button>
    <button class="kpi-card" data-kpi="laba-hari-ini" onclick="gt('list','accounting')">
      <span class="kpi-lbl">Laba Hari Ini</span><span class="kpi-val" id="kv-profit-today">Rp0</span><span class="kpi-trend t-up">+0%</span>
      <svg class="kpi-spark" viewBox="0 0 100 24" aria-hidden="true"><polyline points="2,19 18,18 34,15 50,13 66,10 82,7 98,5"/></svg>
      <span class="kpi-meta" id="kpi-updated-profit">Pembaruan: -</span>
      <span class="kpi-ripple" aria-hidden="true"></span>
    </button>
  </div>`;
}
