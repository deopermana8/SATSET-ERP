export const renderCustomerHtml = (api: string): string => `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SATSET Customer Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #f6f8f6;
      --surface: #ffffff;
      --surface-soft: #f2f8f4;
      --text: #153024;
      --muted: #5c7568;
      --brand: #0ea965;
      --brand-2: #0f766e;
      --accent: #f59e0b;
      --danger: #dc2626;
      --border: #dce8e0;
      --radius: 16px;
      --shadow: 0 16px 40px rgba(8, 32, 18, 0.08);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: "Plus Jakarta Sans", system-ui, sans-serif; background: radial-gradient(circle at 20% -10%, #d8f7e8 0, transparent 45%), var(--bg); color: var(--text); }
    a { color: inherit; text-decoration: none; }
    .container { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 40;
      backdrop-filter: blur(10px);
      background: color-mix(in oklab, #ffffff 86%, transparent);
      border-bottom: 1px solid var(--border);
    }
    .topbar-inner { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 64px; }
    .brand { font-weight: 800; letter-spacing: 0.02em; }
    .menu { display: flex; flex-wrap: wrap; gap: 8px; }
    .menu a { padding: 8px 12px; border-radius: 999px; font-size: 13px; color: var(--muted); }
    .menu a:hover { background: #e9f6ef; color: var(--text); }
    .btn { border: 0; border-radius: 12px; padding: 10px 14px; font-weight: 700; cursor: pointer; }
    .btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .btn-brand { background: linear-gradient(135deg, var(--brand), var(--brand-2)); color: #fff; }
    .btn-soft { background: #e9f6ef; color: #0e5137; }
    .btn-line { background: #fff; border: 1px solid var(--border); color: var(--text); }
    .btn-danger { background: #fee2e2; color: #7f1d1d; border: 1px solid #fecaca; }
    .hero { display: grid; gap: 16px; grid-template-columns: 1.4fr 1fr; padding: 34px 0 18px; }
    .hero-card {
      background: linear-gradient(145deg, #103a2d, #175640);
      border-radius: 24px;
      color: #e8fff4;
      padding: 24px;
      box-shadow: var(--shadow);
      position: relative;
      overflow: hidden;
    }
    .hero-card::after {
      content: "";
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      right: -70px;
      top: -90px;
      background: radial-gradient(circle, rgba(255,255,255,0.2), transparent 68%);
    }
    .hero h1 { margin: 0 0 10px; font-size: clamp(26px, 4vw, 42px); line-height: 1.1; }
    .hero p { margin: 0 0 20px; color: #c7f7e3; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .hero-aside {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 18px;
      box-shadow: var(--shadow);
    }
    .chip { display: inline-flex; align-items: center; gap: 6px; background: #ecfdf5; color: #0f5132; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 700; }
    .route { display: none; padding: 18px 0 40px; }
    .route.active { display: block; }
    .grid { display: grid; gap: 14px; }
    .grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); }
    .card h3 { margin: 0 0 8px; font-size: 17px; }
    .card p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.5; }
    .section-title { margin: 22px 0 12px; font-size: 22px; }
    .form-grid { display: grid; gap: 10px; }
    label { font-size: 12px; color: var(--muted); font-weight: 700; }
    input, select, textarea {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      background: #fff;
      color: var(--text);
      font: inherit;
    }
    textarea { min-height: 90px; resize: vertical; }
    .kpi { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
    .kpi .card { padding: 12px; }
    .kpi .label { color: var(--muted); font-size: 12px; }
    .kpi .value { font-size: 18px; font-weight: 800; margin-top: 4px; }
    .totals { display: grid; gap: 8px; margin-top: 10px; }
    .totals .row { display: flex; justify-content: space-between; font-size: 13px; }
    .totals .grand { font-weight: 800; font-size: 15px; border-top: 1px dashed var(--border); padding-top: 8px; }
    .notice { margin-top: 10px; padding: 10px 12px; border-radius: 10px; font-size: 13px; }
    .notice.ok { background: #ecfdf3; color: #0f5132; border: 1px solid #b7ebcf; }
    .notice.err { background: #fef2f2; color: #7f1d1d; border: 1px solid #fecaca; }
    .notice.warn { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
    .ticket-box { display: grid; gap: 10px; }
    .ticket-meta { display: grid; gap: 4px; font-size: 13px; color: var(--muted); }
    .qr-wrap { display: inline-block; background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 10px; }
    .history-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .history-table th, .history-table td { border-bottom: 1px solid var(--border); text-align: left; padding: 8px; }
    .wizard {
      display: grid;
      gap: 12px;
    }
    .wizard-steps {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 8px;
    }
    .wizard-step {
      border: 1px solid var(--border);
      background: var(--surface-soft);
      border-radius: 12px;
      padding: 10px 8px;
      text-align: center;
      font-size: 11px;
      color: var(--muted);
      font-weight: 700;
    }
    .wizard-step.active { border-color: #52c895; background: #e9f6ef; color: #0f5132; }
    .wizard-panel { display: none; }
    .wizard-panel.active { display: block; }
    .service-option {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      cursor: pointer;
      background: #fff;
    }
    .service-option.active { border-color: #52c895; background: #ecfdf5; }
    .slots { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .slot-btn {
      border: 1px solid var(--border);
      background: #fff;
      border-radius: 10px;
      padding: 10px;
      text-align: left;
      cursor: pointer;
    }
    .slot-btn.active { border-color: #52c895; background: #ecfdf5; }
    .slot-btn.full { opacity: 0.45; cursor: not-allowed; }
    .status-pill {
      display: inline-flex;
      padding: 4px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
    }
    .status-UNPAID { background: #fff7ed; color: #9a3412; }
    .status-PENDING { background: #eff6ff; color: #1d4ed8; }
    .status-PAID { background: #ecfdf3; color: #0f5132; }
    .status-FAILED { background: #fef2f2; color: #7f1d1d; }
    .status-CANCELLED { background: #f4f4f5; color: #3f3f46; }
    .notification-list { display: grid; gap: 8px; }
    .notification-item { border: 1px solid var(--border); border-radius: 12px; padding: 10px; background: #fff; }
    .notification-item small { color: var(--muted); }
    .payment-card { display: grid; gap: 12px; }
    .countdown { font-size: 22px; font-weight: 800; }
    .mobile-nav { display: none; }
    .hero-badge-row { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }

    @media (max-width: 960px) {
      .hero { grid-template-columns: 1fr; }
      .grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .kpi { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .wizard-steps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .slots { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 767px) {
      .topbar-inner { min-height: 56px; }
      .menu { display: none; }
      .container { width: min(1120px, calc(100% - 20px)); }
      .grid-3, .grid-2, .grid-4 { grid-template-columns: 1fr; }
      .kpi { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .wizard-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .slots { grid-template-columns: 1fr; }
      .mobile-nav {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        position: fixed;
        bottom: 10px;
        left: 10px;
        right: 10px;
        z-index: 50;
        background: color-mix(in oklab, #fff 92%, transparent);
        border: 1px solid var(--border);
        border-radius: 16px;
        backdrop-filter: blur(8px);
        box-shadow: var(--shadow);
      }
      .mobile-nav button {
        border: 0;
        background: transparent;
        font-size: 11px;
        padding: 10px 6px;
        color: var(--muted);
        font-weight: 700;
      }
      body { padding-bottom: 82px; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="container topbar-inner">
      <div class="brand">SATSET Customer Portal</div>
      <nav class="menu">
        <a href="/customer" data-link>Beranda</a>
        <a href="/customer/booking" data-link>Booking</a>
        <a href="/customer/history" data-link>Riwayat</a>
        <a href="/customer/profile" data-link>Profile</a>
        <a href="/customer/login" data-link>Login</a>
      </nav>
      <button id="header-auth-btn" class="btn btn-soft" type="button">Login</button>
    </div>
  </header>

  <main class="container">
    <section id="route-landing" class="route active" data-route="/customer">
      <div class="hero">
        <article class="hero-card">
          <span class="chip">Customer Online Booking</span>
          <h1>Booking Wizard SATSET untuk Tiket, Outbound, dan Cafe</h1>
          <p>Alur booking 6 langkah dengan kalkulasi harga realtime, kuota kursi live, promo voucher, dan e-ticket QR profesional.</p>
          <div class="hero-actions">
            <button class="btn btn-brand" data-nav="/customer/booking" type="button">Mulai Booking</button>
            <button class="btn btn-line" data-nav="/customer/register" type="button">Daftar Akun</button>
          </div>
          <div class="hero-badge-row">
            <span class="chip">Realtime Price</span>
            <span class="chip">Promo Voucher</span>
            <span class="chip">Payment Countdown</span>
          </div>
        </article>
        <aside class="hero-aside">
          <h3 style="margin:0 0 10px">Notification Center</h3>
          <div id="landing-notifications" class="notification-list"></div>
        </aside>
      </div>

      <h2 class="section-title">Paket Wisata</h2>
      <section class="grid grid-3">
        <article class="card"><h3>Paket Family</h3><p>Tiket keluarga + voucher cafe.</p></article>
        <article class="card"><h3>Paket Couple</h3><p>Akses area premium + dokumentasi.</p></article>
        <article class="card"><h3>Paket Group</h3><p>Diskon kuantitas untuk rombongan.</p></article>
      </section>

      <h2 class="section-title">Paket Outbound</h2>
      <section class="grid grid-3">
        <article class="card"><h3>Adventure Basic</h3><p>Team building 3 jam.</p></article>
        <article class="card"><h3>Adventure Pro</h3><p>Team challenge + fasilitator.</p></article>
        <article class="card"><h3>Corporate Camp</h3><p>Program sehari penuh.</p></article>
      </section>

      <h2 class="section-title">Cafe</h2>
      <section class="grid grid-3">
        <article class="card"><h3>Indoor Lounge</h3><p>Area nyaman untuk keluarga.</p></article>
        <article class="card"><h3>Outdoor Deck</h3><p>Pemandangan area wisata.</p></article>
        <article class="card"><h3>Menu Signature</h3><p>Kopi, makanan ringan, dan hidangan utama.</p></article>
      </section>

      <footer>Copyright SATSET Portal - Booking Wizard - Notification Center</footer>
    </section>

    <section id="route-login" class="route" data-route="/customer/login">
      <h2 class="section-title">Login Customer</h2>
      <article class="card">
        <form id="login-form" class="form-grid">
          <div>
            <label>Email atau Nomor HP</label>
            <input id="login-identifier" required placeholder="email@domain.com / 08xxxx" />
          </div>
          <div>
            <label>Password</label>
            <input id="login-password" type="password" required />
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap">
            <button class="btn btn-brand" type="submit">Masuk</button>
            <button class="btn btn-line" type="button" data-nav="/customer/register">Daftar Akun</button>
          </div>
        </form>
        <div id="login-msg"></div>
      </article>
    </section>

    <section id="route-register" class="route" data-route="/customer/register">
      <h2 class="section-title">Registrasi Customer</h2>
      <article class="card">
        <form id="register-form" class="form-grid">
          <div class="grid grid-2">
            <div><label>Nama</label><input id="reg-name" required /></div>
            <div><label>Email</label><input id="reg-email" type="email" required /></div>
          </div>
          <div class="grid grid-2">
            <div><label>No HP</label><input id="reg-phone" required placeholder="08xxxx" /></div>
            <div><label>Password</label><input id="reg-password" type="password" required minlength="6" /></div>
          </div>
          <button class="btn btn-brand" type="submit">Daftar</button>
        </form>
        <div id="register-msg"></div>
      </article>
    </section>

    <section id="route-dashboard" class="route" data-route="/customer/dashboard">
      <h2 class="section-title">Dashboard Customer</h2>
      <section class="kpi">
        <article class="card"><div class="label">Booking Aktif</div><div class="value" id="dash-active">0</div></article>
        <article class="card"><div class="label">Riwayat Booking</div><div class="value" id="dash-history">0</div></article>
        <article class="card"><div class="label">Status Pembayaran</div><div class="value" id="dash-payment">-</div></article>
        <article class="card"><div class="label">Voucher</div><div class="value" id="dash-voucher">0</div></article>
        <article class="card"><div class="label">Notifikasi</div><div class="value" id="dash-notif">0</div></article>
      </section>
      <h3 class="section-title">Booking Aktif</h3>
      <article class="card" id="dash-active-list"></article>
      <h3 class="section-title">Notification Center</h3>
      <article class="card"><div id="dashboard-notifications" class="notification-list"></div></article>
    </section>

    <section id="route-booking" class="route" data-route="/customer/booking">
      <h2 class="section-title">Booking Wizard</h2>
      <article class="card wizard">
        <div class="wizard-steps" id="wizard-steps"></div>

        <div class="wizard-panel" data-step="1">
          <h3>Step 1 - Pilih Layanan</h3>
          <div class="grid grid-3">
            <button type="button" class="service-option" data-service="ticket">Tiket</button>
            <button type="button" class="service-option" data-service="outbound">Outbound</button>
            <button type="button" class="service-option" data-service="cafe">Cafe</button>
          </div>
        </div>

        <div class="wizard-panel" data-step="2">
          <h3>Step 2 - Pilih Tanggal</h3>
          <input id="wiz-date" type="date" />
          <div id="wiz-date-msg"></div>
        </div>

        <div class="wizard-panel" data-step="3">
          <h3>Step 3 - Pilih Jam</h3>
          <div id="wiz-availability" class="slots"></div>
        </div>

        <div class="wizard-panel" data-step="4">
          <h3>Step 4 - Jumlah Peserta</h3>
          <div class="grid grid-2">
            <div id="wiz-ticket-fields">
              <label>Dewasa</label>
              <input id="wiz-adults" type="number" min="0" value="1" />
              <label style="margin-top:8px">Anak</label>
              <input id="wiz-children" type="number" min="0" value="0" />
            </div>
            <div id="wiz-shared-fields" class="form-grid">
              <div id="wiz-outbound-package-wrap">
                <label>Paket Outbound</label>
                <select id="wiz-package"><option value="basic">Adventure Basic</option><option value="pro">Adventure Pro</option><option value="camp">Corporate Camp</option></select>
              </div>
              <div>
                <label>Peserta</label>
                <input id="wiz-participants" type="number" min="1" value="2" />
              </div>
              <div id="wiz-cafe-area-wrap">
                <label>Area Cafe</label>
                <select id="wiz-area"><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option></select>
              </div>
            </div>
          </div>
        </div>

        <div class="wizard-panel" data-step="5">
          <h3>Step 5 - Ringkasan Booking</h3>
          <div class="grid grid-2">
            <div>
              <label>Kode Promo / Voucher</label>
              <input id="wiz-promo" placeholder="Contoh: HEMAT10" />
              <button id="wiz-promo-apply" type="button" class="btn btn-soft" style="margin-top:8px">Gunakan Promo</button>
              <div id="wiz-summary-head" class="notice ok">Isi data booking untuk melihat ringkasan.</div>
            </div>
            <div class="totals" id="wiz-totals"></div>
          </div>
        </div>

        <div class="wizard-panel" data-step="6">
          <h3>Step 6 - Pembayaran</h3>
          <div class="payment-card">
            <div class="grid grid-2">
              <div><label>Gateway</label><select id="wiz-pay-gateway"><option value="sandbox">Sandbox</option><option value="midtrans">Midtrans</option><option value="xendit">Xendit</option></select></div>
              <div><label>Metode</label><select id="wiz-pay-method"><option value="virtual-account">Virtual Account</option><option value="qris">QRIS</option><option value="card">Card</option></select></div>
            </div>
            <button class="btn btn-brand" id="wiz-booking-submit" type="button">Buat Booking & Bayar</button>
            <div id="wiz-payment-status"></div>
          </div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:space-between">
          <button id="wiz-prev" type="button" class="btn btn-line">Sebelumnya</button>
          <button id="wiz-next" type="button" class="btn btn-brand">Berikutnya</button>
        </div>
      </article>
    </section>

    <section id="route-payment" class="route" data-route="/customer/payment">
      <h2 class="section-title">Payment</h2>
      <article class="card payment-card">
        <div><span id="payment-status-pill" class="status-pill status-UNPAID">UNPAID</span></div>
        <div class="countdown" id="payment-countdown">00:00</div>
        <div class="grid grid-2">
          <div><label>Gateway</label><select id="payment-gateway"><option value="sandbox">Sandbox</option><option value="midtrans">Midtrans</option><option value="xendit">Xendit</option></select></div>
          <div><label>Metode</label><select id="payment-method"><option value="virtual-account">Virtual Account</option><option value="qris">QRIS</option><option value="card">Card</option></select></div>
        </div>
        <div><label>Booking ID</label><input id="payment-booking-id" placeholder="Masukkan booking id" /></div>
        <button class="btn btn-brand" id="pay-btn" type="button">Proses Pembayaran</button>
        <button class="btn btn-line" id="pay-refresh-btn" type="button">Refresh Status</button>
        <button class="btn btn-danger" id="pay-cancel-btn" type="button">Batalkan Booking</button>
        <div id="payment-msg"></div>
      </article>
    </section>

    <section id="route-history" class="route" data-route="/customer/history">
      <h2 class="section-title">Riwayat Booking</h2>
      <article class="card form-grid">
        <div class="grid grid-4">
          <div><label>Dari</label><input id="history-from" type="date" /></div>
          <div><label>Sampai</label><input id="history-to" type="date" /></div>
          <div><label>Tipe</label><select id="history-type"><option value="all">Semua</option><option value="ticket">Ticket</option><option value="outbound">Outbound</option><option value="cafe">Cafe</option></select></div>
          <div><label>Status</label><select id="history-status"><option value="all">Semua</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option><option value="unpaid">Unpaid</option><option value="failed">Failed</option></select></div>
        </div>
        <button class="btn btn-soft" id="history-filter-btn" type="button">Filter</button>
      </article>
      <article class="card" style="margin-top:12px">
        <table class="history-table">
          <thead><tr><th>Tipe</th><th>Booking</th><th>Invoice</th><th>Status</th><th>Jadwal</th><th>Total</th></tr></thead>
          <tbody id="history-body"></tbody>
        </table>
      </article>
    </section>

    <section id="route-profile" class="route" data-route="/customer/profile">
      <h2 class="section-title">Profile Customer</h2>
      <article class="card">
        <form id="profile-form" class="form-grid">
          <div class="grid grid-2">
            <div><label>Nama</label><input id="profile-name" required /></div>
            <div><label>Email</label><input id="profile-email" type="email" readonly /></div>
          </div>
          <div class="grid grid-2">
            <div><label>Nomor HP</label><input id="profile-phone" required /></div>
            <div><label>Tanggal Lahir</label><input id="profile-birth-date" type="date" /></div>
          </div>
          <div class="grid grid-2">
            <div><label>Gender</label><select id="profile-gender"><option value="other">Other</option><option value="male">Male</option><option value="female">Female</option></select></div>
            <div><label>Emergency Contact</label><input id="profile-emergency" placeholder="Nama - Nomor HP" /></div>
          </div>
          <div><label>Alamat</label><textarea id="profile-address"></textarea></div>
          <div><label>URL Foto</label><input id="profile-avatar" placeholder="https://..." /></div>
          <div><label>Password Baru</label><input id="profile-password" type="password" placeholder="Kosongkan jika tidak ganti" /></div>
          <button class="btn btn-brand" type="submit">Simpan Profile</button>
        </form>
        <div id="profile-msg"></div>
      </article>
    </section>

    <section id="route-ticket" class="route" data-route="/customer/ticket">
      <h2 class="section-title">E-Ticket Profesional</h2>
      <article class="card ticket-box">
        <div class="ticket-meta" id="ticket-detail"></div>
        <div class="grid grid-2">
          <div class="qr-wrap" id="ticket-qr"></div>
          <div class="form-grid">
            <button id="ticket-download-png" class="btn btn-soft" type="button">Download PNG</button>
            <button id="ticket-download-pdf" class="btn btn-line" type="button">Download PDF</button>
          </div>
        </div>
      </article>
    </section>
  </main>

  <nav class="mobile-nav">
    <button type="button" data-nav="/customer">Beranda</button>
    <button type="button" data-nav="/customer/booking">Booking</button>
    <button type="button" data-nav="/customer/history">History</button>
    <button type="button" data-nav="/customer/profile">Profile</button>
  </nav>

  <script>
    const API_BASE = ${JSON.stringify(api)};

    class ApiClient {
      async request(path, options = {}) {
        const token = localStorage.getItem("satset.customer.token");
        const headers = Object.assign({ "content-type": "application/json" }, options.headers || {});
        if (token) headers.authorization = "Bearer " + token;
        const response = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        if (!response.ok) throw new Error((data && data.error) || "Request gagal");
        return data;
      }
    }

    class CustomerService {
      constructor(api) { this.api = api; }
      register(payload) { return this.api.request("/customer/register", { method: "POST", body: JSON.stringify(payload) }); }
      login(payload) { return this.api.request("/customer/login", { method: "POST", body: JSON.stringify(payload) }); }
      profile() { return this.api.request("/customer/profile"); }
      updateProfile(payload) { return this.api.request("/customer/profile", { method: "PUT", body: JSON.stringify(payload) }); }
      dashboard() { return this.api.request("/customer/dashboard"); }
      notifications() { return this.api.request("/customer/notifications"); }
      history(filters) {
        const params = new URLSearchParams();
        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);
        if (filters.type) params.set("type", filters.type);
        if (filters.status) params.set("status", filters.status);
        const qs = params.toString();
        return this.api.request("/customer/history" + (qs ? "?" + qs : ""));
      }
      ticket(id) { return this.api.request("/customer/ticket/" + encodeURIComponent(id)); }
      promos() { return this.api.request("/customer/promos"); }
    }

    class BookingService {
      constructor(api) { this.api = api; }
      availability(type, date) {
        const params = new URLSearchParams();
        params.set("type", type);
        if (date) params.set("date", date);
        return this.api.request("/customer/availability?" + params.toString());
      }
      quote(payload) { return this.api.request("/customer/booking/quote", { method: "POST", body: JSON.stringify(payload) }); }
      createTicket(payload) { return this.api.request("/customer/booking/ticket", { method: "POST", body: JSON.stringify(payload) }); }
      createOutbound(payload) { return this.api.request("/customer/booking/outbound", { method: "POST", body: JSON.stringify(payload) }); }
      createCafe(payload) { return this.api.request("/customer/booking/cafe", { method: "POST", body: JSON.stringify(payload) }); }
      cancelBooking(bookingId) { return this.api.request("/customer/booking/" + encodeURIComponent(bookingId) + "/cancel", { method: "POST" }); }
    }

    class PaymentGateway {
      constructor(key) { this.key = key; }
      async checkout() { throw new Error("Gateway belum diimplementasikan"); }
    }

    class CheckoutGateway extends PaymentGateway {
      async checkout(input, api) {
        return api.request("/customer/payment/checkout", { method: "POST", body: JSON.stringify(Object.assign({}, input, { gateway: this.key })) });
      }
    }

    class PaymentService {
      constructor(api) {
        this.api = api;
        this.gateways = {
          sandbox: new CheckoutGateway("sandbox"),
          midtrans: new CheckoutGateway("midtrans"),
          xendit: new CheckoutGateway("xendit")
        };
      }
      async checkout(payload) {
        const gateway = this.gateways[payload.gateway] || this.gateways.sandbox;
        return gateway.checkout(payload, this.api);
      }
      status(bookingId) { return this.api.request("/customer/payment/status/" + encodeURIComponent(bookingId)); }
    }

    class ProfileService {
      constructor(customerService) { this.customerService = customerService; }
      get() { return this.customerService.profile(); }
      save(payload) { return this.customerService.updateProfile(payload); }
    }

    const apiClient = new ApiClient();
    const customerService = new CustomerService(apiClient);
    const bookingService = new BookingService(apiClient);
    const paymentService = new PaymentService(apiClient);
    const profileService = new ProfileService(customerService);

    const wizardStepLabels = [
      "Step 1 Layanan",
      "Step 2 Tanggal",
      "Step 3 Jam",
      "Step 4 Peserta",
      "Step 5 Ringkasan",
      "Step 6 Pembayaran"
    ];

    const state = {
      user: null,
      pendingBookingId: "",
      paymentCountdownTimer: 0,
      quoteDebounceTimer: 0,
      wizard: {
        step: 1,
        service: "ticket",
        date: "",
        time: "",
        adults: 1,
        children: 0,
        participants: 2,
        packageCode: "basic",
        area: "indoor",
        promoCode: "",
        latestQuote: null,
        availability: []
      },
      lastTicket: null
    };

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function safeQrSvg(svg) {
      const raw = String(svg || "");
      const lowered = raw.toLowerCase();
      if (!lowered.startsWith("<svg") || !lowered.includes("</svg>")) return "";
      if (lowered.includes("<script") || lowered.includes("javascript:")) return "";
      if (/on[a-z]+=/.test(lowered)) return "";
      return raw;
    }

    function showMessage(targetId, message, kind) {
      const root = document.getElementById(targetId);
      if (!root) return;
      const tone = kind || "ok";
      const box = document.createElement("div");
      box.className = "notice " + tone;
      box.textContent = String(message || "");
      root.innerHTML = "";
      root.appendChild(box);
    }

    function activePath() {
      const p = location.pathname;
      if (p.startsWith("/customer/ticket/")) return "/customer/ticket";
      return p;
    }

    function setActiveRoute(path) {
      document.querySelectorAll(".route").forEach((node) => node.classList.remove("active"));
      const route = document.querySelector('.route[data-route="' + path + '"]');
      if (route) route.classList.add("active");
      if (path === "/customer/dashboard") loadDashboard();
      if (path === "/customer/history") loadHistory();
      if (path === "/customer/profile") loadProfile();
      if (path === "/customer/booking") syncWizardUI();
      if (path === "/customer") loadLandingNotifications();
      if (path === "/customer/ticket") {
        const id = location.pathname.split("/").pop();
        if (id) loadTicket(id);
      }
    }

    function navigate(path) {
      history.pushState({}, "", path);
      const p = activePath();
      if (!ensureAuth(p)) return;
      setActiveRoute(p);
    }

    function resetWizardState() {
      state.wizard.step = 1;
      state.wizard.service = "ticket";
      state.wizard.date = "";
      state.wizard.time = "";
      state.wizard.adults = 1;
      state.wizard.children = 0;
      state.wizard.participants = 2;
      state.wizard.packageCode = "basic";
      state.wizard.area = "indoor";
      state.wizard.promoCode = "";
      state.wizard.latestQuote = null;
      state.wizard.availability = [];
    }

    function clearCustomerSessionData() {
      localStorage.removeItem("satset.customer.token");
      localStorage.removeItem("satset.customer.session");
      sessionStorage.removeItem("satset.customer.token");
      sessionStorage.removeItem("satset.customer.session");
    }

    function logoutCustomer() {
      if (state.paymentCountdownTimer) {
        window.clearInterval(state.paymentCountdownTimer);
        state.paymentCountdownTimer = 0;
      }
      if (state.quoteDebounceTimer) {
        window.clearTimeout(state.quoteDebounceTimer);
        state.quoteDebounceTimer = 0;
      }
      clearCustomerSessionData();
      state.user = null;
      state.pendingBookingId = "";
      state.lastTicket = null;
      resetWizardState();
      syncHeaderAuth();
      history.replaceState({}, "", "/customer/login");
      setActiveRoute("/customer/login");
    }

    function ensureAuth(path) {
      const protectedPaths = ["/customer/dashboard", "/customer/profile", "/customer/history", "/customer/payment", "/customer/booking", "/customer/ticket"];
      if (protectedPaths.includes(path) && !localStorage.getItem("satset.customer.token")) {
        history.replaceState({}, "", "/customer/login");
        setActiveRoute("/customer/login");
        return false;
      }
      return true;
    }

    function formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
    }

    function fmtCountdown(totalSeconds) {
      const sec = Math.max(0, Number(totalSeconds || 0));
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }

    function renderWizardSteps() {
      const wrap = document.getElementById("wizard-steps");
      wrap.innerHTML = wizardStepLabels.map((label, idx) => '<div class="wizard-step ' + (state.wizard.step === (idx + 1) ? "active" : "") + '">' + label + "</div>").join("");
    }

    function scheduleRealtimeQuote() {
      if (state.wizard.step < 4) return;
      if (state.quoteDebounceTimer) window.clearTimeout(state.quoteDebounceTimer);
      state.quoteDebounceTimer = window.setTimeout(() => {
        refreshQuote().catch((error) => showMessage("wiz-summary-head", error.message, "err"));
      }, 180);
    }

    function toggleWizardPanels() {
      document.querySelectorAll(".wizard-panel").forEach((panel) => {
        panel.classList.toggle("active", Number(panel.getAttribute("data-step")) === state.wizard.step);
      });
      document.getElementById("wiz-prev").disabled = state.wizard.step <= 1;
      document.getElementById("wiz-next").disabled = state.wizard.step >= 6;
    }

    function syncServiceButtons() {
      document.querySelectorAll(".service-option").forEach((node) => {
        const active = node.getAttribute("data-service") === state.wizard.service;
        node.classList.toggle("active", active);
      });
      const isTicket = state.wizard.service === "ticket";
      const isOutbound = state.wizard.service === "outbound";
      const isCafe = state.wizard.service === "cafe";
      document.getElementById("wiz-ticket-fields").style.display = isTicket ? "block" : "none";
      document.getElementById("wiz-outbound-package-wrap").style.display = isOutbound ? "block" : "none";
      document.getElementById("wiz-cafe-area-wrap").style.display = isCafe ? "block" : "none";
    }

    function collectWizardPayload() {
      const type = state.wizard.service;
      const base = { type, date: state.wizard.date, time: state.wizard.time, promoCode: state.wizard.promoCode };
      if (type === "ticket") {
        return Object.assign({}, base, { adults: state.wizard.adults, children: state.wizard.children });
      }
      if (type === "outbound") {
        return Object.assign({}, base, { participants: state.wizard.participants, packageCode: state.wizard.packageCode });
      }
      return Object.assign({}, base, { pax: state.wizard.participants, area: state.wizard.area });
    }

    async function refreshQuote() {
      const payload = collectWizardPayload();
      if (!payload.date || !payload.time) return;
      const quote = await bookingService.quote(payload);
      state.wizard.latestQuote = quote;
      renderWizardTotals();
      const label = payload.type.toUpperCase() + " - " + payload.date + " " + payload.time;
      showMessage("wiz-summary-head", "Ringkasan realtime aktif: " + label + (quote.price.promoCode ? " - Promo " + quote.price.promoCode : ""), "ok");
    }

    function renderWizardTotals() {
      const root = document.getElementById("wiz-totals");
      const q = state.wizard.latestQuote;
      if (!q || !q.price) {
        root.innerHTML = '<div class="row"><span>Subtotal</span><strong>-</strong></div>';
        return;
      }
      root.innerHTML = '<div class="row"><span>Subtotal</span><strong>' + formatCurrency(q.price.subtotal) + '</strong></div>' +
        '<div class="row"><span>Diskon</span><strong>- ' + formatCurrency(q.price.discount) + '</strong></div>' +
        '<div class="row"><span>Pajak</span><strong>' + formatCurrency(q.price.tax) + '</strong></div>' +
        '<div class="row"><span>Service</span><strong>' + formatCurrency(q.price.service) + '</strong></div>' +
        '<div class="row grand"><span>Grand Total</span><strong>' + formatCurrency(q.price.grandTotal) + "</strong></div>";
    }

    async function refreshAvailability() {
      if (!state.wizard.date) {
        document.getElementById("wiz-availability").innerHTML = '<div class="notice warn">Pilih tanggal terlebih dahulu.</div>';
        return;
      }
      const data = await bookingService.availability(state.wizard.service, state.wizard.date);
      state.wizard.availability = data.slots || [];
      if (!state.wizard.availability.some((slot) => slot.time === state.wizard.time && !slot.isFull)) {
        state.wizard.time = "";
      }
      const slotsRoot = document.getElementById("wiz-availability");
      slotsRoot.innerHTML = state.wizard.availability.map((slot) => {
        const full = slot.isFull || slot.remaining <= 0;
        const active = state.wizard.time === slot.time;
        return '<button type="button" class="slot-btn ' + (full ? "full" : "") + " " + (active ? "active" : "") + '" data-slot="' + slot.time + '" ' + (full ? "disabled" : "") + '><strong>' + slot.time + '</strong><br/><small>' + (full ? "Full" : "Sisa " + slot.remaining) + "</small></button>";
      }).join("");
    }

    function syncWizardUI() {
      renderWizardSteps();
      toggleWizardPanels();
      syncServiceButtons();
      document.getElementById("wiz-date").value = state.wizard.date || "";
      document.getElementById("wiz-adults").value = String(state.wizard.adults);
      document.getElementById("wiz-children").value = String(state.wizard.children);
      document.getElementById("wiz-participants").value = String(state.wizard.participants);
      document.getElementById("wiz-package").value = state.wizard.packageCode;
      document.getElementById("wiz-area").value = state.wizard.area;
      document.getElementById("wiz-promo").value = state.wizard.promoCode;
      renderWizardTotals();
      if (state.wizard.step >= 3) {
        refreshAvailability().catch((error) => showMessage("wiz-date-msg", error.message, "err"));
      }
      if (state.wizard.step >= 5) {
        refreshQuote().catch((error) => showMessage("wiz-summary-head", error.message, "err"));
      }
    }

    function wizardCanMoveTo(step) {
      if (step <= 1) return true;
      if (!state.wizard.service) return false;
      if (step >= 3 && !state.wizard.date) return false;
      if (step >= 4 && !state.wizard.time) return false;
      if (step >= 5) {
        if (state.wizard.service === "ticket") {
          if ((state.wizard.adults + state.wizard.children) <= 0) return false;
        } else if (state.wizard.participants <= 0) {
          return false;
        }
      }
      return true;
    }

    async function loadNotificationsInto(targetId) {
      const root = document.getElementById(targetId);
      if (!root) return;
      if (!localStorage.getItem("satset.customer.token")) {
        root.innerHTML = '<div class="notification-item"><strong>Belum login</strong><br/><small>Login untuk melihat notifikasi booking, pembayaran, voucher, dan promo.</small></div>';
        return;
      }
      try {
        const data = await customerService.notifications();
        root.innerHTML = (data.items || []).slice(0, 5).map((item) => {
          return '<div class="notification-item"><strong>' + escapeHtml(item.title) + '</strong><div>' + escapeHtml(item.message) + '</div><small>' + escapeHtml(new Date(item.createdAt).toLocaleString("id-ID")) + '</small></div>';
        }).join("") || '<div class="notification-item"><small>Belum ada notifikasi</small></div>';
      } catch (error) {
        root.innerHTML = '<div class="notification-item"><small>' + escapeHtml(error.message) + '</small></div>';
      }
    }

    async function loadLandingNotifications() {
      await loadNotificationsInto("landing-notifications");
    }

    async function loadDashboard() {
      try {
        const data = await customerService.dashboard();
        document.getElementById("dash-active").textContent = String(data.activeBookings || 0);
        document.getElementById("dash-history").textContent = String(data.totalBookings || 0);
        document.getElementById("dash-payment").textContent = data.paymentStatus || "-";
        document.getElementById("dash-voucher").textContent = String(data.vouchers || 0);
        document.getElementById("dash-notif").textContent = String(data.unreadNotifications || 0);
        const list = document.getElementById("dash-active-list");
        list.innerHTML = (data.bookings || []).slice(0, 5).map((item) => {
          return '<div style="padding:8px 0;border-bottom:1px solid var(--border)"><strong>' + escapeHtml(item.type.toUpperCase()) + "</strong> - " + escapeHtml(item.bookingNumber) + " - <span class='status-pill status-" + escapeHtml(item.paymentStatus) + "'>" + escapeHtml(item.paymentStatus) + "</span></div>";
        }).join("") || "Belum ada booking aktif.";
        await loadNotificationsInto("dashboard-notifications");
      } catch (error) {
        showMessage("payment-msg", error.message, "err");
      }
    }

    async function loadHistory() {
      try {
        const filters = {
          from: document.getElementById("history-from").value,
          to: document.getElementById("history-to").value,
          type: document.getElementById("history-type").value,
          status: document.getElementById("history-status").value
        };
        const data = await customerService.history(filters);
        const body = document.getElementById("history-body");
        body.innerHTML = (data.items || []).map((row) => {
          return "<tr><td>" + escapeHtml(row.type) + "</td><td>" + escapeHtml(row.bookingNumber) + "</td><td>" + escapeHtml(row.invoiceNumber || "-") + "</td><td><span class='status-pill status-" + escapeHtml(row.paymentStatus) + "'>" + escapeHtml(row.paymentStatus) + "</span></td><td>" + escapeHtml(row.date + " " + row.time) + "</td><td>" + escapeHtml(formatCurrency(row.grandTotal)) + "</td></tr>";
        }).join("") || '<tr><td colspan="6">Belum ada data</td></tr>';
      } catch (error) {
        showMessage("profile-msg", error.message, "err");
      }
    }

    async function loadProfile() {
      try {
        const profile = await profileService.get();
        state.user = profile;
        document.getElementById("profile-name").value = profile.name || "";
        document.getElementById("profile-email").value = profile.email || "";
        document.getElementById("profile-phone").value = profile.phone || "";
        document.getElementById("profile-address").value = profile.address || "";
        document.getElementById("profile-birth-date").value = profile.birthDate || "";
        document.getElementById("profile-gender").value = profile.gender || "other";
        document.getElementById("profile-emergency").value = profile.emergencyContact || "";
        document.getElementById("profile-avatar").value = profile.avatarUrl || "";
      } catch (error) {
        showMessage("profile-msg", error.message, "err");
      }
    }

    async function loadTicket(id) {
      try {
        const ticket = await customerService.ticket(id);
        state.lastTicket = ticket;
        document.getElementById("ticket-detail").innerHTML =
          "<div><strong>Nama Customer:</strong> " + escapeHtml(ticket.customerName) + "</div>" +
          "<div><strong>Booking Number:</strong> " + escapeHtml(ticket.bookingNumber) + "</div>" +
          "<div><strong>Tanggal:</strong> " + escapeHtml(ticket.date) + "</div>" +
          "<div><strong>Jam:</strong> " + escapeHtml(ticket.time) + "</div>" +
          "<div><strong>Status:</strong> <span class='status-pill status-" + escapeHtml(ticket.paymentStatus) + "'>" + escapeHtml(ticket.paymentStatus) + "</span></div>";
        const qr = safeQrSvg(ticket.qrSvg);
        document.getElementById("ticket-qr").innerHTML = qr || "QR belum tersedia";
      } catch (error) {
        showMessage("payment-msg", error.message, "err");
      }
    }

    function syncHeaderAuth() {
      const btn = document.getElementById("header-auth-btn");
      const token = localStorage.getItem("satset.customer.token");
      if (token) {
        btn.textContent = "Logout";
        btn.onclick = () => logoutCustomer();
      } else {
        btn.textContent = "Login";
        btn.onclick = () => navigate("/customer/login");
      }
    }

    function setPaymentPill(status) {
      const pill = document.getElementById("payment-status-pill");
      pill.className = "status-pill status-" + status;
      pill.textContent = status;
    }

    function startCountdown(seconds) {
      if (state.paymentCountdownTimer) window.clearInterval(state.paymentCountdownTimer);
      let left = Math.max(0, Number(seconds || 0));
      document.getElementById("payment-countdown").textContent = fmtCountdown(left);
      state.paymentCountdownTimer = window.setInterval(() => {
        left -= 1;
        document.getElementById("payment-countdown").textContent = fmtCountdown(left);
        if (left <= 0) {
          window.clearInterval(state.paymentCountdownTimer);
          state.paymentCountdownTimer = 0;
          refreshPaymentStatus();
        }
      }, 1000);
    }

    async function refreshPaymentStatus() {
      try {
        const bookingId = document.getElementById("payment-booking-id").value || state.pendingBookingId;
        if (!bookingId) return;
        const result = await paymentService.status(bookingId);
        setPaymentPill(result.status);
        startCountdown(result.countdownSeconds || 0);
        showMessage("payment-msg", "Status pembayaran: " + result.status, result.status === "FAILED" ? "err" : "ok");
      } catch (error) {
        showMessage("payment-msg", error.message, "err");
      }
    }

    function downloadTicketPng() {
      if (!state.lastTicket) return;
      const svgSource = document.getElementById("ticket-qr").innerHTML;
      if (!svgSource) return;
      const blob = new Blob([svgSource], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width + 40;
        canvas.height = img.height + 120;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 16px Plus Jakarta Sans";
        ctx.fillText(state.lastTicket.bookingNumber, 20, 28);
        ctx.drawImage(img, 20, 40);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = state.lastTicket.bookingNumber + ".png";
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    function downloadTicketPdf() {
      if (!state.lastTicket) return;
      const win = window.open("", "_blank");
      if (!win) return;
      const qrHtml = document.getElementById("ticket-qr").innerHTML;
      win.document.write("<html><head><title>Ticket PDF</title><style>body{font-family:Arial,sans-serif;padding:24px}h1{margin:0 0 8px} .meta{margin:6px 0}</style></head><body>");
      win.document.write("<h1>SATSET E-Ticket</h1>");
      win.document.write("<div class='meta'><strong>Nama:</strong> " + escapeHtml(state.lastTicket.customerName) + "</div>");
      win.document.write("<div class='meta'><strong>Booking:</strong> " + escapeHtml(state.lastTicket.bookingNumber) + "</div>");
      win.document.write("<div class='meta'><strong>Tanggal:</strong> " + escapeHtml(state.lastTicket.date) + "</div>");
      win.document.write("<div class='meta'><strong>Jam:</strong> " + escapeHtml(state.lastTicket.time) + "</div>");
      win.document.write("<div class='meta'><strong>Status:</strong> " + escapeHtml(state.lastTicket.paymentStatus) + "</div>");
      win.document.write("<div style='margin-top:16px'>" + safeQrSvg(qrHtml) + "</div>");
      win.document.write("</body></html>");
      win.document.close();
      win.focus();
      win.print();
    }

    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-link],[data-nav],[data-service],[data-slot]");
      if (!target) return;

      if (target.hasAttribute("data-service")) {
        state.wizard.service = target.getAttribute("data-service");
        state.wizard.time = "";
        state.wizard.latestQuote = null;
        syncWizardUI();
        return;
      }

      if (target.hasAttribute("data-slot")) {
        state.wizard.time = target.getAttribute("data-slot");
        syncWizardUI();
        return;
      }

      const nextPath = target.getAttribute("data-link") || target.getAttribute("data-nav");
      if (!nextPath) return;
      event.preventDefault();
      if (nextPath === "/customer/booking" && !localStorage.getItem("satset.customer.token")) {
        navigate("/customer/login");
        return;
      }
      if (!ensureAuth(nextPath)) return;
      navigate(nextPath);
    });

    window.addEventListener("popstate", () => {
      const p = activePath();
      if (!ensureAuth(p)) return;
      setActiveRoute(p);
    });

    document.getElementById("register-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const result = await customerService.register({
          name: document.getElementById("reg-name").value,
          email: document.getElementById("reg-email").value,
          phone: document.getElementById("reg-phone").value,
          password: document.getElementById("reg-password").value
        });
        showMessage("register-msg", "Registrasi berhasil. Customer ID: " + result.customer.id, "ok");
        navigate("/customer/login");
      } catch (error) {
        showMessage("register-msg", error.message, "err");
      }
    });

    document.getElementById("login-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const login = await customerService.login({
          identifier: document.getElementById("login-identifier").value,
          password: document.getElementById("login-password").value
        });
        localStorage.setItem("satset.customer.token", login.token);
        state.user = login.customer;
        syncHeaderAuth();
        showMessage("login-msg", "Login berhasil", "ok");
        navigate("/customer/dashboard");
      } catch (error) {
        showMessage("login-msg", error.message, "err");
      }
    });

    document.getElementById("wiz-date").addEventListener("change", async (event) => {
      state.wizard.date = event.target.value;
      state.wizard.time = "";
      state.wizard.latestQuote = null;
      await refreshAvailability();
      showMessage("wiz-date-msg", "Tanggal dipilih: " + state.wizard.date, "ok");
      renderWizardTotals();
      scheduleRealtimeQuote();
    });

    document.getElementById("wiz-adults").addEventListener("input", (event) => {
      state.wizard.adults = Math.max(0, Number(event.target.value || 0));
      scheduleRealtimeQuote();
    });
    document.getElementById("wiz-children").addEventListener("input", (event) => {
      state.wizard.children = Math.max(0, Number(event.target.value || 0));
      scheduleRealtimeQuote();
    });
    document.getElementById("wiz-participants").addEventListener("input", (event) => {
      state.wizard.participants = Math.max(1, Number(event.target.value || 1));
      scheduleRealtimeQuote();
    });
    document.getElementById("wiz-package").addEventListener("change", (event) => {
      state.wizard.packageCode = event.target.value;
      scheduleRealtimeQuote();
    });
    document.getElementById("wiz-area").addEventListener("change", (event) => {
      state.wizard.area = event.target.value;
      scheduleRealtimeQuote();
    });
    document.getElementById("wiz-promo").addEventListener("input", (event) => {
      state.wizard.promoCode = event.target.value.toUpperCase();
      scheduleRealtimeQuote();
    });

    document.getElementById("wiz-promo-apply").addEventListener("click", async () => {
      try {
        await refreshQuote();
      } catch (error) {
        showMessage("wiz-summary-head", error.message, "err");
      }
    });

    document.getElementById("wiz-prev").addEventListener("click", () => {
      if (state.wizard.step > 1) {
        state.wizard.step -= 1;
        syncWizardUI();
      }
    });

    document.getElementById("wiz-next").addEventListener("click", async () => {
      const nextStep = state.wizard.step + 1;
      if (!wizardCanMoveTo(nextStep)) {
        showMessage("wiz-summary-head", "Lengkapi step saat ini terlebih dahulu.", "warn");
        return;
      }
      if (nextStep >= 5) {
        try {
          await refreshQuote();
        } catch (error) {
          showMessage("wiz-summary-head", error.message, "err");
          return;
        }
      }
      if (state.wizard.step < 6) {
        state.wizard.step += 1;
        syncWizardUI();
      }
    });

    document.getElementById("wiz-booking-submit").addEventListener("click", async () => {
      try {
        if (!localStorage.getItem("satset.customer.token")) {
          navigate("/customer/login");
          return;
        }
        const payload = collectWizardPayload();
        let result;
        if (state.wizard.service === "ticket") result = await bookingService.createTicket(payload);
        else if (state.wizard.service === "outbound") result = await bookingService.createOutbound(payload);
        else result = await bookingService.createCafe(payload);

        const bookingId = result.booking.id;
        state.pendingBookingId = bookingId;
        document.getElementById("payment-booking-id").value = bookingId;

        const payResult = await paymentService.checkout({
          bookingId,
          gateway: document.getElementById("wiz-pay-gateway").value,
          method: document.getElementById("wiz-pay-method").value
        });

        showMessage("wiz-payment-status", "Booking " + result.booking.bookingNumber + " - Payment " + payResult.payment.status, payResult.payment.status === "FAILED" ? "err" : "ok");
        navigate("/customer/ticket/" + bookingId);
      } catch (error) {
        showMessage("wiz-payment-status", error.message, "err");
      }
    });

    document.getElementById("pay-btn").addEventListener("click", async () => {
      try {
        if (!localStorage.getItem("satset.customer.token")) { navigate("/customer/login"); return; }
        const bookingId = document.getElementById("payment-booking-id").value || state.pendingBookingId;
        if (!bookingId) throw new Error("Booking ID wajib diisi");
        const result = await paymentService.checkout({
          bookingId,
          gateway: document.getElementById("payment-gateway").value,
          method: document.getElementById("payment-method").value
        });
        setPaymentPill(result.payment.status);
        startCountdown(result.countdownSeconds || 0);
        showMessage("payment-msg", "Pembayaran " + result.payment.status + " - Invoice: " + result.payment.invoiceNumber, result.payment.status === "FAILED" ? "err" : "ok");
        navigate("/customer/ticket/" + bookingId);
      } catch (error) {
        showMessage("payment-msg", error.message, "err");
      }
    });

    document.getElementById("pay-refresh-btn").addEventListener("click", () => {
      refreshPaymentStatus();
    });

    document.getElementById("pay-cancel-btn").addEventListener("click", async () => {
      try {
        if (!localStorage.getItem("satset.customer.token")) { navigate("/customer/login"); return; }
        const bookingId = document.getElementById("payment-booking-id").value || state.pendingBookingId;
        if (!bookingId) throw new Error("Booking ID wajib diisi");
        const result = await bookingService.cancelBooking(bookingId);
        state.pendingBookingId = result.booking.id;
        document.getElementById("payment-booking-id").value = result.booking.id;
        setPaymentPill(result.booking.paymentStatus);
        await refreshPaymentStatus();
        showMessage("payment-msg", "Booking dibatalkan: " + result.booking.bookingNumber, "warn");
      } catch (error) {
        showMessage("payment-msg", error.message, "err");
      }
    });

    document.getElementById("history-filter-btn").addEventListener("click", () => loadHistory());

    document.getElementById("profile-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const payload = {
          name: document.getElementById("profile-name").value,
          phone: document.getElementById("profile-phone").value,
          birthDate: document.getElementById("profile-birth-date").value,
          gender: document.getElementById("profile-gender").value,
          emergencyContact: document.getElementById("profile-emergency").value,
          address: document.getElementById("profile-address").value,
          avatarUrl: document.getElementById("profile-avatar").value,
          password: document.getElementById("profile-password").value
        };
        await profileService.save(payload);
        showMessage("profile-msg", "Profile berhasil diperbarui", "ok");
      } catch (error) {
        showMessage("profile-msg", error.message, "err");
      }
    });

    document.getElementById("ticket-download-png").addEventListener("click", downloadTicketPng);
    document.getElementById("ticket-download-pdf").addEventListener("click", downloadTicketPdf);

    syncHeaderAuth();
    syncWizardUI();
    const initialPath = activePath();
    if (ensureAuth(initialPath)) {
      setActiveRoute(initialPath);
    }
  </script>
</body>
</html>`;
