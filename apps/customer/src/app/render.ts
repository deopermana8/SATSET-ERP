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
      --bg: #f5f8f5;
      --surface: #ffffff;
      --surface-soft: #f0f7f3;
      --surface-2: #eaf4ee;
      --text: #111f17;
      --muted: #50705e;
      --brand: #059669;
      --brand-2: #0d7a6b;
      --brand-soft: #d1fae5;
      --success: #059669;
      --success-soft: #d1fae5;
      --warning: #d97706;
      --warning-soft: #fef3c7;
      --info: #0284c7;
      --info-soft: #e0f2fe;
      --danger: #dc2626;
      --danger-soft: #fee2e2;
      --accent: #f59e0b;
      --border: #d4e8da;
      --radius: 16px;
      --shadow: 0 8px 32px rgba(8,32,18,0.08),0 2px 8px rgba(8,32,18,0.04);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: "Plus Jakarta Sans", system-ui, sans-serif; background: radial-gradient(circle at 20% -10%, #d8f7e8 0, transparent 45%), var(--bg); color: var(--text); overflow-x: hidden; }
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
    .menu a { padding: 8px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
    .menu a:hover { background: var(--brand-soft); color: var(--brand-2); }
    /* nav-auth hidden until login; nav-guest shown on landing */
    .nav-auth { display: none; }
    /* internal operator routes — never visible to customers */
    #route-cashier,#route-gate,#route-kitchen,
    #route-supplier,#route-inventory,#route-purchase,#route-purchase-detail,
    #route-recipe,#route-stock-adjustment,#route-stock-movement { display: none !important; }
    .btn { border: 0; border-radius: 12px; padding: 11px 15px; font-weight: 700; cursor: pointer; font-size: 13px; min-height: 44px; }
    .btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .btn-brand { background: linear-gradient(135deg, var(--brand), var(--brand-2)); color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.28); transition: opacity .15s, box-shadow .15s; }
    .btn-brand:hover { opacity: .92; box-shadow: 0 6px 20px rgba(5,150,105,0.36); }
    .btn-soft { background: var(--brand-soft); color: #065f46; }
    .btn-soft:hover { background: #a7f3d0; }
    .btn-line { background: #fff; border: 1.5px solid var(--border); color: var(--text); }
    .btn-line:hover { background: var(--surface-soft); border-color: #9dc8b0; }
    .btn-danger { background: var(--danger-soft); color: #7f1d1d; border: 1px solid #fecaca; }
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
    .chip { display: inline-flex; align-items: center; gap: 6px; background: var(--brand-soft); color: #065f46; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 700; }
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
      min-height: 44px;
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
    .notice.ok { background: var(--success-soft); color: #065f46; border: 1px solid #6ee7b7; }
    .notice.err { background: var(--danger-soft); color: #7f1d1d; border: 1px solid #fca5a5; }
    .notice.warn { background: var(--warning-soft); color: #92400e; border: 1px solid #fcd34d; }
    .notice.info { background: var(--info-soft); color: #075985; border: 1px solid #7dd3fc; }
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
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 8px;
    }
    .wizard-step {
      border: 1px solid var(--border);
      background: var(--surface-soft);
      border-radius: 12px;
      padding: 10px 8px;
      text-align: left;
      font-size: 12px;
      color: var(--muted);
      font-weight: 700;
      display: grid;
      gap: 4px;
    }
    .wizard-step.active { border-color: #52c895; background: #e9f6ef; color: #0f5132; box-shadow: 0 0 0 2px rgba(82,200,149,0.15); }
    .wizard-step.complete { background: #103a2d; border-color: #103a2d; color: #e8fff4; }
    .wizard-step.upcoming { opacity: 0.86; }
    .wizard-step-index { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
    .wizard-step-label { font-size: 13px; line-height: 1.25; }
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
    .status-WAITING_PAYMENT { background: #fff7ed; color: #9a3412; }
    .status-CONFIRMED { background: #ecfeff; color: #155e75; }
    .status-CHECKED_IN { background: #f0fdf4; color: #166534; }
    .status-COMPLETED { background: #ecfdf5; color: #14532d; }
    .status-VOID { background: #fef2f2; color: #991b1b; }
    .status-EXPIRED { background: #faf5ff; color: #6b21a8; }
    .notification-list { display: grid; gap: 8px; }
    .notification-item { border: 1px solid var(--border); border-radius: 12px; padding: 10px; background: #fff; }
    .notification-item small { color: var(--muted); }
    .payment-card { display: grid; gap: 12px; }
    .countdown { font-size: 22px; font-weight: 800; }
    .mobile-nav { display: none; }
    .hero-badge-row { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
    .section-head { display:flex; align-items:flex-end; justify-content:space-between; gap:12px; margin-bottom:12px; }
    .section-head p { margin: 4px 0 0; font-size: 13px; color: var(--muted); }
    .section-kicker {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      margin-bottom: 8px;
      border-radius: 999px;
      background: #e8fff4;
      color: #0f5132;
      border: 1px solid #b6ecd0;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .pos-shell { display:grid; grid-template-columns: minmax(0,1.8fr) minmax(300px,0.95fr); gap:14px; }
    .pos-main { display:grid; gap:12px; }
    .tab-row { display:flex; gap:8px; flex-wrap:wrap; }
    .tab-btn {
      border: 1px solid var(--border);
      background: #fff;
      color: var(--muted);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .tab-btn.active { background: #ecfdf5; color: #065f46; border-color: #69d3a2; }
    .catalog-shell { display:grid; grid-template-columns: 220px minmax(0,1fr); gap:12px; align-items:start; }
    .catalog-filter {
      border: 1px solid var(--border);
      border-radius: 14px;
      background: #f8fcf9;
      padding: 10px;
      display:grid;
      gap:8px;
      position: sticky;
      top: 88px;
    }
    .catalog-filter h4 { margin: 0 0 2px; font-size: 13px; color: var(--muted); }
    .catalog-filter p { margin: 0; font-size: 12px; color: var(--muted); }
    .product-grid { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:14px; }
    .product-card {
      border: 1px solid var(--border);
      border-radius: 14px;
      background: #fff;
      overflow: hidden;
      display: grid;
      min-height: 100%;
      transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
      box-shadow: 0 4px 10px rgba(8,32,18,0.05);
    }
    .product-card:hover {
      transform: translateY(-2px);
      border-color: #8ecfb0;
      box-shadow: 0 10px 24px rgba(8,32,18,0.1);
    }
    .product-card.selected {
      border-color: #1e9f6e;
      box-shadow: 0 0 0 3px rgba(30,159,110,0.2), 0 12px 28px rgba(8,32,18,0.13);
    }
    .product-figure {
      aspect-ratio: 4 / 3;
      background: linear-gradient(150deg, #def7ea, #c7f0df 58%, #effaf4);
      border-bottom: 1px solid var(--border);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#0f5132;
      font-weight:800;
      font-size:13px;
      position: relative;
      overflow: hidden;
    }
    .product-figure img { width:100%; height:100%; object-fit:cover; display:block; }
    .img-fallback {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      padding: 10px;
      text-align: center;
      color: #14532d;
      background: linear-gradient(150deg, #d9fbe9, #c0f2da 60%, #eefcf5);
    }
    .product-figure img + .img-fallback { display: none; }
    .product-figure.is-fallback img { display: none !important; }
    .product-figure.is-fallback .img-fallback { display: grid; }
    .product-body { padding: 12px; display:grid; gap:9px; }
    .product-name { margin:0; font-size:14px; line-height:1.4; }
    .product-subtitle { margin: -2px 0 0; color: var(--muted); font-size: 12px; }
    .product-meta { display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:12px; color:var(--muted); }
    .product-price { font-size: 16px; color: #065f46; letter-spacing: 0.01em; }
    .category-badge {
      display:inline-flex;
      align-items:center;
      border-radius:999px;
      padding:4px 8px;
      font-size:11px;
      font-weight:700;
      background:#eef2ff;
      color:#3730a3;
      border:1px solid #c7d2fe;
    }
    .availability-badge {
      display:inline-flex;
      align-items:center;
      border-radius:999px;
      padding: 4px 8px;
      font-size:11px;
      font-weight:700;
      background:#ecfdf5;
      color:#166534;
      border:1px solid #86efac;
    }
    .availability-badge.low { background:#fff7ed; color:#9a3412; border-color:#fdba74; }
    .availability-badge.full { background:#fef2f2; color:#991b1b; border-color:#fca5a5; }
    .product-actions { display:flex; gap:8px; align-items:center; }
    .product-actions .btn { min-width: 44px; justify-content: center; }
    .qty-pill {
      width: 74px;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px;
      font: inherit;
      min-height: 44px;
    }
    .order-panel {
      display:grid;
      gap:10px;
      align-content:start;
      position: sticky;
      top: 86px;
      padding: 18px;
      border-radius: 22px;
      background: linear-gradient(180deg, #ffffff, #f8fcf9);
    }
    .order-title { margin:0; font-size:16px; }
    .panel-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
    .panel-heading p { margin: 4px 0 0; font-size: 12px; color: var(--muted); }
    .panel-count {
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding: 7px 10px;
      border-radius: 999px;
      background: #ecfdf5;
      border: 1px solid #b7ebcf;
      color: #166534;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
    }
    .order-items { display:grid; gap:8px; max-height: 320px; overflow:auto; padding-right:2px; }
    .order-item {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px;
      display:grid;
      gap: 4px;
      background: #fff;
    }
    .order-item-top { display:flex; justify-content:space-between; gap:8px; align-items:flex-start; }
    .order-item small { color: var(--muted); }
    .order-total-box { border-top:1px dashed var(--border); padding-top:10px; display:grid; gap:8px; }
    .order-total-row { display:flex; align-items:center; justify-content:space-between; font-size:13px; }
    .order-total-row strong { font-size:15px; }
    .empty-state {
      border: 1px dashed var(--border);
      border-radius: 16px;
      padding: 18px 16px;
      display: grid;
      gap: 6px;
      text-align: left;
      background: linear-gradient(180deg, #ffffff, #f6fbf8);
    }
    .empty-state strong { font-size: 14px; }
    .empty-state p { margin: 0; font-size: 12px; color: var(--muted); line-height: 1.55; }
    .empty-state-badge {
      display:inline-flex;
      align-items:center;
      width:max-content;
      padding: 5px 9px;
      border-radius: 999px;
      background: #eef8f2;
      color: #166534;
      border: 1px solid #cdebd9;
      font-size: 11px;
      font-weight: 800;
    }
    .table-block {
      display: grid;
      gap: 10px;
      padding: 14px;
      border-radius: 18px;
      border: 1px solid var(--border);
      background: linear-gradient(180deg, #ffffff, #f8fcf9);
    }
    .table-block h3 { margin: 0; font-size: 18px; }
    .table-block p { margin: 0; font-size: 12px; color: var(--muted); }
    .table-legend { display:flex; gap:8px; flex-wrap:wrap; }
    .legend-pill {
      display:inline-flex;
      align-items:center;
      gap:6px;
      padding:6px 10px;
      border-radius:999px;
      background:#fff;
      border:1px solid var(--border);
      font-size:11px;
      font-weight:700;
      color:var(--muted);
    }
    .legend-dot {
      width:9px;
      height:9px;
      border-radius:50%;
      display:inline-block;
      background:#cbd5e1;
    }
    .legend-dot.empty { background:#a7f3d0; }
    .legend-dot.occupied { background:#93c5fd; }
    .legend-dot.waiting { background:#fdba74; }
    .table-grid { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:8px; }
    .table-chip {
      border: 1px solid var(--border);
      background: #fff;
      border-radius: 16px;
      padding: 14px 12px;
      text-align: center;
      cursor: pointer;
      display:grid;
      gap:6px;
      min-height: 84px;
    }
    .table-chip .table-no { font-weight: 800; letter-spacing: 0.08em; font-size: 18px; }
    .table-chip .table-status { font-size: 11px; color: var(--muted); font-weight:700; }
    .table-chip.selected { border-color:#1e9f6e; background:#ecfdf5; box-shadow: 0 0 0 3px rgba(30,159,110,0.2); }
    .table-chip.occupied { background:#eff6ff; border-color:#93c5fd; }
    .table-chip.waiting { background:#fff7ed; border-color:#fdba74; }
    .ghost-inputs { display:none; }
    .quick-date { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
    .quick-date .btn { padding: 8px 10px; font-size: 12px; }
    .member-strip {
      border:1px dashed #86efac;
      border-radius:12px;
      padding:10px;
      background:#f0fdf4;
      display:grid;
      gap:8px;
      margin-top:10px;
    }
    .member-strip .title { font-weight: 800; }
    .member-strip .hint { margin: 0; font-size: 12px; color: #166534; }
    .contact-hint { margin-top: 8px; font-size: 12px; color: #166534; }
    .helper-text { margin: 0; font-size: 12px; color: var(--muted); }
    .member-actions { display:grid; gap:8px; }
    .member-action-card {
      border: 1px solid #cdebd9;
      border-radius: 12px;
      padding: 12px;
      background: rgba(255,255,255,0.7);
      display:grid;
      gap:8px;
    }
    .member-action-card p { margin: 0; font-size: 12px; color: #166534; }

    @media (max-width: 960px) {
      .hero { grid-template-columns: 1fr; }
      .grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .kpi { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .wizard-steps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .slots { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .pos-shell { grid-template-columns: 1fr; }
      .catalog-shell { grid-template-columns: 1fr; }
      .catalog-filter { position: static; }
      .product-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
      .table-grid { grid-template-columns: repeat(3, minmax(0,1fr)); }
    }

    @media (max-width: 767px) {
      .topbar-inner { min-height: 56px; }
      .menu { display: none; }
      .container { width: min(1120px, calc(100% - 20px)); }
      .grid-3, .grid-2, .grid-4 { grid-template-columns: 1fr; }
      .kpi { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .wizard-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .slots { grid-template-columns: 1fr; }
      .product-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
      .table-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
      .pos-shell { padding-bottom: 110px; }
      .order-panel {
        position: sticky;
        bottom: 70px;
        top: auto;
        z-index: 30;
        background: color-mix(in oklab, #ffffff 94%, transparent);
        backdrop-filter: blur(8px);
      }
      .mobile-nav {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
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
        padding: 10px 4px;
        min-height: 48px;
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
        <a href="/customer/booking" data-link class="nav-auth">Booking</a>
        <a href="/customer/history" data-link class="nav-auth">Riwayat</a>
        <a href="/customer/profile" data-link class="nav-auth">Profil</a>
        <a href="/customer/register" data-link class="nav-guest">Daftar</a>
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
          <p>Alur booking 5 langkah dengan kalkulasi harga realtime, kuota kursi live, promo voucher, dan e-ticket QR profesional.</p>
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

      <footer>Copyright SATSET Portal - Booking Wizard</footer>
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
      <h2 class="section-title">Ringkasan Akun</h2>
      <section class="kpi">
        <article class="card"><div class="label">Reservasi Saya</div><div class="value" id="dash-my-reservations">0</div></article>
        <article class="card"><div class="label">Menunggu Bayar</div><div class="value" id="dash-waiting-payment">0</div></article>
        <article class="card"><div class="label">Kunjungan Hari Ini</div><div class="value" id="dash-today-visitor">0</div></article>
        <article class="card"><div class="label">Kunjungan Mendatang</div><div class="value" id="dash-upcoming-visitor">0</div></article>
        <article class="card"><div class="label">Activity Booking</div><div class="value" id="dash-activity-today">0</div></article>
        <article class="card"><div class="label">Sesi Mendatang</div><div class="value" id="dash-activity-upcoming">0</div></article>
      </section>
      <h3 class="section-title">Notifikasi</h3>
      <article class="card"><div id="dashboard-notifications" class="notification-list"></div></article>
    </section>

    <section id="route-cashier" class="route" data-route="/cashier">
      <h2 class="section-title">Shift Kasir</h2>
      <article class="card form-grid">
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-brand" id="cashier-open-btn" type="button">OPEN</button>
          <button class="btn btn-line" id="cashier-close-btn" type="button">CLOSE</button>
          <button class="btn btn-soft" id="cashier-refresh-btn" type="button">REFRESH</button>
        </div>
        <div class="grid grid-4">
          <div><label>Cashier ID</label><input id="cashier-id" value="CSR-001" /></div>
          <div><label>Cashier Name</label><input id="cashier-name" value="Kasir Utama" /></div>
          <div><label>Opening Cash</label><input id="cashier-opening-cash" type="number" min="0" value="0" /></div>
          <div><label>Closing Cash</label><input id="cashier-closing-cash" type="number" min="0" value="0" /></div>
        </div>
        <div class="grid grid-4">
          <div><label>Shift Status</label><input id="cashier-status" readonly /></div>
          <div><label>Cash</label><input id="cashier-cash-sales" readonly /></div>
          <div><label>QRIS</label><input id="cashier-qris-sales" readonly /></div>
          <div><label>Transfer</label><input id="cashier-transfer-sales" readonly /></div>
        </div>
        <div class="grid grid-4">
          <div><label>Total Ticket</label><input id="cashier-ticket-count" readonly /></div>
          <div><label>Expected Cash</label><input id="cashier-expected-cash" readonly /></div>
          <div><label>Current Cash</label><input id="cashier-current-cash" readonly /></div>
          <div><label>Difference</label><input id="cashier-difference" readonly /></div>
        </div>
        <div id="cashier-msg"></div>
      </article>
      <h3 class="section-title">History</h3>
      <article class="card" id="cashier-history"></article>
    </section>

    <section id="route-booking" class="route" data-route="/customer/booking">
      <div class="section-head">
        <div>
          <span class="section-kicker">Checkout Wisata</span>
          <h2 class="section-title" style="margin:0;">Booking Wizard</h2>
          <p>Alur pemesanan wisata yang ringkas, nyaman, dan tetap ramah untuk guest checkout.</p>
        </div>
      </div>
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
          <h3>Step 4 - Data Kontak</h3>
          <div class="grid grid-2">
            <div id="wiz-ticket-fields" class="card">
              <label style="display:block; margin-bottom:8px;">Ringkasan Pengunjung</label>
              <label>Dewasa</label>
              <input id="wiz-adults" type="number" min="0" value="1" />
              <label style="margin-top:8px">Anak</label>
              <input id="wiz-children" type="number" min="0" value="0" />
            </div>
            <div id="wiz-shared-fields" class="card form-grid">
              <label style="display:block; margin-bottom:2px;">Detail Kunjungan</label>
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
          <div class="grid grid-3" style="margin-top:10px;">
            <div><label>Nama Pemesan (opsional)</label><input id="wiz-customer-name" placeholder="Nama" /></div>
            <div><label>No HP</label><input id="wiz-customer-phone" placeholder="08xxxx" /></div>
            <div><label>Email</label><input id="wiz-customer-email" type="email" placeholder="email@domain.com" /></div>
          </div>
          <p class="contact-hint">Masukkan nomor HP atau email untuk menerima informasi pemesanan.</p>
          <p class="helper-text">Salah satu wajib diisi.</p>
          <div class="member-strip">
            <div class="title">Member SATSET</div>
            <p class="hint">Sudah pernah berkunjung? Gunakan nomor HP atau email untuk cek status member. Jika belum, lanjut daftar tanpa mengganggu proses checkout.</p>
            <div class="member-actions">
              <div class="member-action-card">
                <strong>Sudah pernah berkunjung?</strong>
                <input id="wiz-member-contact" placeholder="Nomor HP / Email member" />
                <button id="wiz-member-check" type="button" class="btn btn-soft">Cek Member</button>
              </div>
              <div class="member-action-card">
                <strong>Belum menjadi member?</strong>
                <p>Daftar member untuk menyimpan benefit promo, point, dan penawaran kunjungan berikutnya.</p>
                <button id="wiz-member-signup" type="button" class="btn btn-line">Daftar Member</button>
              </div>
            </div>
            <div id="wiz-member-result" class="notice info">Member benefit: diskon, point, promo, harga khusus, voucher. Validasi member akan aktif setelah backend siap.</div>
          </div>
        </div>

        <div class="wizard-panel" data-step="5">
          <h3>Step 5 - Review & Pembayaran</h3>
          <div class="grid grid-2">
            <div>
              <label>Kode Promo / Voucher</label>
              <input id="wiz-promo" placeholder="Contoh: HEMAT10" />
              <button id="wiz-promo-apply" type="button" class="btn btn-soft" style="margin-top:8px">Gunakan Promo</button>
              <div id="wiz-summary-head" class="notice ok">Isi data booking untuk melihat ringkasan.</div>
            </div>
            <div class="totals" id="wiz-totals"></div>
          </div>
          <article class="card" id="wiz-review-contact" style="margin-top:10px;"></article>
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

    <section id="route-ticketing" class="route" data-route="/ticketing">
      <div class="section-head">
        <div>
          <span class="section-kicker">Wisata Ticketing</span>
          <h2 class="section-title" style="margin:0;">POS Ticketing</h2>
          <p>Katalog tiket image-first dengan kategori, ketersediaan, dan order panel real-time.</p>
        </div>
      </div>
      <article class="pos-shell">
        <section class="card pos-main">
          <div class="grid grid-3">
            <div><label>Nama Customer</label><input id="pos-customer-name" placeholder="Nama customer" /></div>
            <div><label>No HP Customer</label><input id="pos-customer-phone" placeholder="08xxxx" /></div>
            <div><label>Metode Bayar</label><select id="pos-payment-method"><option value="CASH">CASH</option><option value="QRIS">QRIS</option><option value="TRANSFER">TRANSFER</option></select></div>
          </div>
          <div class="catalog-shell">
            <aside class="catalog-filter">
              <h4>Kategori Tiket</h4>
              <p>Pilih kategori untuk memfokuskan produk yang tampil di katalog.</p>
              <div class="tab-row" id="pos-category-tabs"></div>
            </aside>
            <section id="pos-ticket-catalog" class="product-grid"></section>
          </div>
          <div class="ghost-inputs">
            <select id="pos-ticket-select"></select>
            <input id="pos-ticket-qty" type="number" min="1" value="1" />
            <button class="btn btn-soft" id="pos-add-item" type="button">Tambah Item</button>
          </div>
        </section>
        <aside class="card order-panel">
          <div class="panel-heading">
            <div>
              <h3 class="order-title">Pesanan</h3>
              <p>Ringkasan transaksi tiket yang sedang dipilih.</p>
            </div>
            <span class="panel-count" id="pos-order-count">0 item</span>
          </div>
          <div class="notice info">Jenis Pesanan: Tiket</div>
          <div id="pos-items" class="order-items"></div>
          <div class="order-total-box">
            <div class="order-total-row"><span>Subtotal</span><strong id="pos-subtotal-text">Rp0</strong></div>
            <div class="grid grid-2">
              <div><label>Diskon</label><input id="pos-discount" type="number" min="0" value="0" /></div>
              <div><label>Pajak</label><input id="pos-tax" type="number" min="0" value="0" /></div>
            </div>
            <div class="order-total-row"><span>Total</span><strong id="pos-total-text">Rp0</strong></div>
            <div class="grid grid-2">
              <div><label>Bayar</label><input id="pos-paid-amount" type="number" min="0" value="0" /></div>
              <div><label>Kembalian</label><input id="pos-change-amount" readonly /></div>
            </div>
            <input id="pos-subtotal" readonly style="display:none;" />
            <input id="pos-total" readonly style="display:none;" />
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-brand" id="pos-save-sale" type="button">Bayar</button>
              <button class="btn btn-line" id="pos-refresh-ticket" type="button">Refresh Tiket</button>
            </div>
            <div id="pos-msg"></div>
          </div>
        </aside>
      </article>
    </section>

    <section id="route-activity-booking" class="route" data-route="/activity-booking">
      <div class="section-head">
        <div>
          <span class="section-kicker">Katalog Outbound</span>
          <h2 class="section-title" style="margin:0;">POS Outbound</h2>
          <p>Pilih aktivitas visual, cek availability badge, lalu tentukan jadwal dengan cepat.</p>
        </div>
      </div>
      <article class="pos-shell">
        <section class="card pos-main">
          <div class="table-block">
            <h3>Jadwal Aktivitas</h3>
            <p>Pilih aktivitas, tentukan hari, lalu lanjutkan ke sesi yang tersedia.</p>
          </div>
          <div class="grid grid-3">
            <div><label>Reservation ID (opsional)</label><input id="ab-reservation-id" placeholder="reservation id" /></div>
            <div><label>Customer Name</label><input id="ab-customer-name" placeholder="Nama customer" /></div>
            <div><label>Qty</label><input id="ab-qty" type="number" min="1" value="1" /></div>
          </div>
          <div class="quick-date">
            <button class="btn btn-line" type="button" data-ab-quick-date="today">Hari Ini</button>
            <button class="btn btn-line" type="button" data-ab-quick-date="tomorrow">Besok</button>
            <button class="btn btn-line" type="button" data-ab-quick-date="next">+2 Hari</button>
          </div>
          <div class="grid grid-3">
            <div><label>Date</label><input id="ab-date" type="date" /></div>
            <div><label>Session</label><input id="ab-session" placeholder="MORNING" /></div>
            <div><label>Capacity</label><input id="ab-capacity" type="number" min="1" value="20" /></div>
          </div>
          <div id="ab-activity-catalog" class="product-grid"></div>
          <div id="ab-schedule-cards" class="product-grid"></div>
          <div class="ghost-inputs">
            <select id="ab-activity-select"></select>
            <select id="ab-schedule-select"></select>
            <button class="btn btn-soft" id="ab-create-schedule-btn" type="button">Create Schedule</button>
          </div>
        </section>
        <aside class="card order-panel">
          <div class="panel-heading">
            <div>
              <h3 class="order-title">Pesanan Outbound</h3>
              <p>Jadwal dan status aktivitas yang dipilih tampil di panel ini.</p>
            </div>
            <span class="panel-count">Aktif</span>
          </div>
          <div id="ab-selected-schedule" class="notice info">Jadwal: belum dipilih</div>
          <div class="grid grid-2">
            <div><label>Payment Method</label><select id="ab-payment-method"><option value="CASH">CASH</option><option value="QRIS">QRIS</option><option value="TRANSFER">TRANSFER</option></select></div>
            <div><label>Status</label><input id="ab-status" value="WAITING_PAYMENT" readonly /></div>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-brand" id="ab-create-booking-btn" type="button">Book Activity</button>
            <button class="btn btn-line" id="ab-refresh-btn" type="button">Refresh</button>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-soft" id="ab-pay-btn" type="button">Pay</button>
            <button class="btn btn-line" id="ab-checkin-btn" type="button">Check-in</button>
            <button class="btn btn-danger" id="ab-cancel-btn" type="button">Cancel</button>
          </div>
          <article class="card">
            <h3 style="margin:0 0 10px;">QR Activity Booking</h3>
            <div class="qr-wrap" id="ab-qr">QR belum tersedia</div>
          </article>
          <article class="card">
            <h3 style="margin:0 0 10px;">Status Timeline</h3>
            <div id="ab-timeline"></div>
          </article>
          <div id="ab-msg"></div>
        </aside>
      </article>

      <h3 class="section-title">Schedule</h3>
      <article class="card" id="ab-schedule-list"></article>

      <h3 class="section-title">Booking List</h3>
      <article class="card" id="ab-booking-list"></article>
    </section>

    <section id="route-cafe" class="route" data-route="/cafe">
      <div class="section-head">
        <div>
          <span class="section-kicker">Cafe Service</span>
          <h2 class="section-title" style="margin:0;">POS Cafe</h2>
          <p>Pilih meja lebih dulu, lalu tambah menu image cards ke order panel berdasarkan nomor meja.</p>
        </div>
      </div>
      <article class="pos-shell">
        <section class="card pos-main">
          <div class="table-block">
            <h3>Pilih Meja</h3>
            <p>Fokus utama untuk layanan dine-in. Pilih meja aktif sebelum menambahkan menu.</p>
            <div class="table-legend">
              <span class="legend-pill"><span class="legend-dot empty"></span>Kosong</span>
              <span class="legend-pill"><span class="legend-dot occupied"></span>Terisi</span>
              <span class="legend-pill"><span class="legend-dot waiting"></span>Menunggu</span>
            </div>
            <div id="cafe-table-selector" class="table-grid"></div>
          </div>
          <div class="tab-row" id="cafe-category-tabs"></div>
          <div id="cafe-menu-catalog" class="product-grid"></div>
          <div class="ghost-inputs">
            <select id="cafe-order-menu"></select>
            <input id="cafe-order-qty" type="number" min="1" value="1" />
            <button class="btn btn-soft" id="cafe-add-cart-btn" type="button">Add Cart</button>
          </div>
          <details class="card">
            <summary style="cursor:pointer; font-weight:700;">Management Kategori & Menu</summary>
            <div class="form-grid" style="margin-top:10px;">
              <div class="grid grid-4">
                <div><label>Category Code</label><input id="cafe-category-code" placeholder="CAT-DRINK" /></div>
                <div><label>Category Name</label><input id="cafe-category-name" placeholder="Minuman" /></div>
                <div><label>Category Active</label><select id="cafe-category-active"><option value="true">true</option><option value="false">false</option></select></div>
                <div style="display:flex;align-items:end"><button class="btn btn-soft" id="cafe-create-category-btn" type="button">Create Category</button></div>
              </div>

              <div class="grid grid-4">
                <div><label>Menu Category</label><select id="cafe-menu-category"></select></div>
                <div><label>Menu Code</label><input id="cafe-menu-code" placeholder="MNU-001" /></div>
                <div><label>Menu Name</label><input id="cafe-menu-name" placeholder="Es Teh" /></div>
                <div><label>Price</label><input id="cafe-menu-price" type="number" min="0" value="10000" /></div>
              </div>
              <div class="grid grid-4">
                <div><label>Stock</label><input id="cafe-menu-stock" type="number" min="0" value="50" /></div>
                <div><label>Menu Active</label><select id="cafe-menu-active"><option value="true">true</option><option value="false">false</option></select></div>
                <div style="display:flex;align-items:end"><button class="btn btn-brand" id="cafe-create-menu-btn" type="button">Create Menu</button></div>
                <div style="display:flex;align-items:end"><button class="btn btn-line" id="cafe-refresh-btn" type="button">Refresh Cafe Data</button></div>
              </div>
            </div>
          </details>
        </section>

        <aside class="card order-panel">
          <div class="panel-heading">
            <div>
              <h3 class="order-title">Pesanan Cafe</h3>
              <p>Panel sticky untuk memantau meja, menu, dan total transaksi.</p>
            </div>
            <span class="panel-count" id="cafe-order-count">0 item</span>
          </div>
          <div class="notice info" id="cafe-selected-table">MEJA 01</div>
          <div class="grid grid-2">
            <div><label>Customer</label><input id="cafe-customer-name" value="Walk In" /></div>
            <div><label>Table</label><input id="cafe-table-number" value="01" /></div>
          </div>
          <div class="grid grid-2">
            <div><label>Order Type</label><select id="cafe-order-type"><option value="DINE_IN">DINE_IN</option><option value="TAKE_AWAY">TAKE_AWAY</option></select></div>
            <div><label>Payment Method</label><select id="cafe-payment-method"><option value="CASH">CASH</option><option value="QRIS">QRIS</option><option value="TRANSFER">TRANSFER</option></select></div>
          </div>
          <div id="cafe-cart" class="order-items"></div>
          <div class="grid grid-2">
            <div><label>Discount</label><input id="cafe-discount" type="number" min="0" value="0" /></div>
            <div><label>Tax</label><input id="cafe-tax" type="number" min="0" value="0" /></div>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-brand" id="cafe-create-order-btn" type="button">Create Order</button>
            <button class="btn btn-line" id="cafe-clear-cart-btn" type="button">Clear Cart</button>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-soft" id="cafe-pay-order-btn" type="button">Pay Order</button>
            <button class="btn btn-line" id="cafe-print-order-btn" type="button">Print Receipt</button>
            <button class="btn btn-danger" id="cafe-void-order-btn" type="button">Void Order</button>
          </div>
          <article class="card">
            <h3 style="margin:0 0 8px;">Receipt</h3>
            <pre id="cafe-receipt" style="white-space:pre-wrap;font:12px/1.4 monospace;">Belum ada receipt</pre>
          </article>
          <div id="cafe-msg"></div>
        </aside>
      </article>

      <h3 class="section-title">Menu List</h3>
      <article class="card" id="cafe-menu-list"></article>

      <h3 class="section-title">Order List</h3>
      <article class="card" id="cafe-order-list"></article>
    </section>

    <section id="route-ticket-preview" class="route" data-route="/ticket-preview">
      <h2 class="section-title">Ticket Preview</h2>
      <article class="card form-grid">
        <div id="ticket-preview-meta" class="ticket-meta"></div>
        <div class="grid grid-2">
          <div class="qr-wrap" id="ticket-preview-qr"></div>
          <div class="form-grid">
            <button class="btn btn-brand" id="ticket-preview-print" type="button">Print Ticket</button>
            <button class="btn btn-line" id="ticket-preview-void" type="button">Void Ticket</button>
            <button class="btn btn-soft" id="ticket-preview-refresh" type="button">Refresh Preview</button>
          </div>
        </div>
        <div class="grid grid-2">
          <article class="card"><h3>Layout 80mm</h3><pre id="ticket-layout-80" style="white-space:pre-wrap;font:12px/1.4 monospace;"></pre></article>
          <article class="card"><h3>Layout 58mm</h3><pre id="ticket-layout-58" style="white-space:pre-wrap;font:12px/1.4 monospace;"></pre></article>
        </div>
        <div id="ticket-preview-msg"></div>
      </article>
    </section>

    <section id="route-gate" class="route" data-route="/gate">
      <h2 class="section-title">Gate Check-in</h2>
      <article class="card form-grid">
        <div><label>QR Token</label><input id="gate-qr-token" placeholder="Paste / scan QR token" /></div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-brand" id="gate-scan-btn" type="button">Check-in</button>
          <button class="btn btn-line" id="gate-reset-btn" type="button">Reset</button>
        </div>
        <div id="gate-result" class="ticket-meta"></div>
        <div id="gate-msg"></div>
      </article>
    </section>

    <section id="route-reservation" class="route" data-route="/reservation">
      <h2 class="section-title">Reservation & Booking Engine</h2>
      <article class="card form-grid">
        <div class="grid grid-2">
          <div><label>Customer Name</label><input id="reservation-customer-name" placeholder="Nama customer" /></div>
          <div><label>Customer Phone</label><input id="reservation-customer-phone" placeholder="08xxxx" /></div>
        </div>
        <div class="grid grid-2">
          <div><label>Customer Email</label><input id="reservation-customer-email" type="email" placeholder="email@domain.com" /></div>
          <div><label>Calendar Visit</label><input id="reservation-visit-date" type="date" /></div>
        </div>
        <div class="grid grid-4">
          <div><label>Session</label><select id="reservation-visit-session"><option value="MORNING">MORNING</option><option value="AFTERNOON">AFTERNOON</option><option value="EVENING">EVENING</option></select></div>
          <div><label>Ticket Selector</label><select id="reservation-ticket-select"></select></div>
          <div><label>Qty</label><input id="reservation-ticket-qty" type="number" min="1" value="1" /></div>
          <div style="display:flex;align-items:end"><button class="btn btn-soft" id="reservation-add-item" type="button">Tambah Ticket</button></div>
        </div>
        <div class="grid grid-2">
          <div><label>Payment Method</label><select id="reservation-payment-method"><option value="CASH">CASH</option><option value="QRIS">QRIS</option><option value="TRANSFER">TRANSFER</option></select></div>
          <div><label>Payment Status</label><input id="reservation-payment-status" value="WAITING_PAYMENT" readonly /></div>
        </div>
        <div id="reservation-items"></div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-brand" id="reservation-create-btn" type="button">Create Booking</button>
          <button class="btn btn-line" id="reservation-refresh-btn" type="button">Refresh Booking List</button>
        </div>
        <div id="reservation-msg"></div>
      </article>

      <h3 class="section-title">Booking List</h3>
      <article class="card" id="reservation-list"></article>
    </section>

    <section id="route-reservation-detail" class="route" data-route="/reservation/:id">
      <h2 class="section-title">Booking Detail</h2>
      <article class="card form-grid">
        <div id="reservation-detail-meta" class="ticket-meta"></div>
        <div class="grid grid-2">
          <div class="qr-wrap" id="reservation-detail-qr">QR belum dimuat</div>
          <div class="form-grid">
            <button class="btn btn-brand" id="reservation-pay-btn" type="button">Pay Reservation</button>
            <button class="btn btn-soft" id="reservation-confirm-btn" type="button">Confirm Reservation</button>
            <button class="btn btn-line" id="reservation-checkin-btn" type="button">Check-in</button>
            <button class="btn btn-danger" id="reservation-cancel-btn" type="button">Cancel Reservation</button>
            <button class="btn btn-line" id="reservation-print-btn" type="button">Print Booking</button>
            <button class="btn btn-soft" id="reservation-detail-refresh-btn" type="button">Refresh Detail</button>
          </div>
        </div>
        <article class="card" id="reservation-status-timeline"></article>
        <div id="reservation-detail-msg"></div>
      </article>
    </section>

    <section id="route-activities" class="route" data-route="/activities">
      <h2 class="section-title">Activities</h2>
      <article class="card form-grid">
        <div class="grid grid-4">
          <div><label>Code</label><input id="activity-code" placeholder="ATV-001" /></div>
          <div><label>Name</label><input id="activity-name" placeholder="Flying Fox" /></div>
          <div><label>Category</label><input id="activity-category" placeholder="OUTBOUND" /></div>
          <div><label>Duration (minute)</label><input id="activity-duration" type="number" min="1" value="60" /></div>
        </div>
        <div class="grid grid-4">
          <div><label>Capacity</label><input id="activity-capacity" type="number" min="1" value="20" /></div>
          <div><label>Price</label><input id="activity-price" type="number" min="0" value="75000" /></div>
          <div><label>Active</label><select id="activity-active"><option value="true">true</option><option value="false">false</option></select></div>
          <div style="display:flex;align-items:end"><button class="btn btn-brand" id="activity-create-btn" type="button">Create Activity</button></div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-line" id="activity-refresh-btn" type="button">Refresh Activities</button>
        </div>
        <div id="activity-msg"></div>
      </article>
      <h3 class="section-title">Daftar Aktivitas</h3>
      <article class="card" id="activity-list"></article>
    </section>


    <section id="route-kitchen" class="route" data-route="/kitchen">
      <h2 class="section-title">Kitchen Monitor</h2>
      <article class="card">
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
          <button class="btn btn-soft" id="kitchen-refresh-btn" type="button">Refresh Kitchen Queue</button>
        </div>
        <div class="grid grid-4">
          <article class="card"><h3>Queue Order</h3><div id="kitchen-queue"></div></article>
          <article class="card"><h3>Preparing</h3><div id="kitchen-preparing"></div></article>
          <article class="card"><h3>Ready</h3><div id="kitchen-ready"></div></article>
          <article class="card"><h3>Completed</h3><div id="kitchen-completed"></div></article>
        </div>
      </article>
    </section>

    <section id="route-supplier" class="route" data-route="/supplier">
      <h2 class="section-title">Supplier</h2>
      <article class="card form-grid">
        <div class="grid grid-3">
          <div><label>Code</label><input id="supplier-code" /></div>
          <div><label>Name</label><input id="supplier-name" /></div>
          <div><label>Phone</label><input id="supplier-phone" /></div>
        </div>
        <div class="grid grid-2">
          <div><label>Email</label><input id="supplier-email" type="email" /></div>
          <div><label>Address</label><input id="supplier-address" /></div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-brand" id="supplier-create-btn" type="button">Create Supplier</button>
          <button class="btn btn-soft" id="supplier-refresh-btn" type="button">Refresh</button>
        </div>
        <div id="supplier-msg"></div>
      </article>
      <article class="card" id="supplier-list"></article>
    </section>

    <section id="route-inventory" class="route" data-route="/inventory">
      <h2 class="section-title">Inventory</h2>
      <section class="kpi">
        <article class="card"><div class="label">Low Stock</div><div class="value" id="inv-kpi-low-stock">0</div></article>
        <article class="card"><div class="label">Inventory Value</div><div class="value" id="inv-kpi-value">0</div></article>
        <article class="card"><div class="label">Purchase Today</div><div class="value" id="inv-kpi-purchase-today">0</div></article>
        <article class="card"><div class="label">Consumption Today</div><div class="value" id="inv-kpi-consumption-today">0</div></article>
        <article class="card"><div class="label">Waste Today</div><div class="value" id="inv-kpi-waste-today">0</div></article>
      </section>
      <article class="card form-grid">
        <div class="grid grid-3">
          <div><label>Code</label><input id="inv-code" /></div>
          <div><label>Name</label><input id="inv-name" /></div>
          <div><label>Unit</label><input id="inv-unit" value="PCS" /></div>
        </div>
        <div class="grid grid-4">
          <div><label>Category</label><input id="inv-category" value="RAW" /></div>
          <div><label>Minimum</label><input id="inv-minimum" type="number" min="0" value="0" /></div>
          <div><label>Current</label><input id="inv-current" type="number" min="0" value="0" /></div>
          <div><label>Average Cost</label><input id="inv-cost" type="number" min="0" value="0" /></div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-brand" id="inv-create-btn" type="button">Create Inventory</button>
          <button class="btn btn-soft" id="inv-refresh-btn" type="button">Refresh</button>
        </div>
        <div id="inv-msg"></div>
      </article>
      <article class="card" id="inv-list"></article>
    </section>

    <section id="route-purchase" class="route" data-route="/purchase">
      <h2 class="section-title">Purchase Order</h2>
      <article class="card form-grid">
        <div class="grid grid-2">
          <div>
            <label>Supplier</label>
            <select id="po-supplier"></select>
          </div>
          <div>
            <label>Inventory Item</label>
            <select id="po-inventory"></select>
          </div>
        </div>
        <div class="grid grid-3">
          <div><label>Qty</label><input id="po-qty" type="number" min="1" value="1" /></div>
          <div><label>Unit Cost</label><input id="po-unit-cost" type="number" min="0" value="0" /></div>
          <div style="display:flex; align-items:flex-end;"><button class="btn btn-line" id="po-add-item-btn" type="button">Add Item</button></div>
        </div>
        <article class="card" id="po-items"></article>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-brand" id="po-create-btn" type="button">Create PO</button>
          <button class="btn btn-soft" id="po-refresh-btn" type="button">Refresh</button>
        </div>
        <div id="po-msg"></div>
      </article>
      <article class="card" id="po-list"></article>
    </section>

    <section id="route-purchase-detail" class="route" data-route="/purchase/:id">
      <h2 class="section-title">Purchase Order Detail</h2>
      <article class="card form-grid">
        <div id="po-detail-meta" class="ticket-meta"></div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-soft" id="po-detail-approve-btn" type="button">Approve PO</button>
          <button class="btn btn-line" id="po-detail-receive-btn" type="button">Receive PO</button>
          <button class="btn btn-soft" id="po-detail-cancel-btn" type="button">Cancel PO</button>
          <button class="btn btn-brand" id="po-detail-refresh-btn" type="button">Refresh Detail</button>
          <button class="btn btn-line" data-nav="/purchase" type="button">Kembali ke List</button>
        </div>
        <div id="po-detail-msg"></div>
      </article>
      <article class="card" id="po-detail-items"></article>
    </section>

    <section id="route-recipe" class="route" data-route="/recipe">
      <h2 class="section-title">Recipe</h2>
      <article class="card form-grid">
        <div class="grid grid-2">
          <div>
            <label>Menu</label>
            <select id="recipe-menu"></select>
          </div>
          <div>
            <label>Inventory</label>
            <select id="recipe-inventory"></select>
          </div>
        </div>
        <div class="grid grid-3">
          <div><label>Qty per Menu</label><input id="recipe-qty" type="number" min="1" value="1" /></div>
          <div style="display:flex; align-items:flex-end;"><button class="btn btn-line" id="recipe-add-item-btn" type="button">Add Ingredient</button></div>
        </div>
        <article class="card" id="recipe-items"></article>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-brand" id="recipe-save-btn" type="button">Save Recipe</button>
          <button class="btn btn-soft" id="recipe-refresh-btn" type="button">Refresh</button>
        </div>
        <div id="recipe-msg"></div>
      </article>
      <article class="card" id="recipe-list"></article>
    </section>

    <section id="route-stock-adjustment" class="route" data-route="/stock-adjustment">
      <h2 class="section-title">Stock Adjustment</h2>
      <article class="card form-grid">
        <div class="grid grid-3">
          <div><label>Inventory</label><select id="adj-inventory"></select></div>
          <div><label>Qty (+/-)</label><input id="adj-qty" type="number" value="0" /></div>
          <div><label>Reason</label><input id="adj-reason" value="Stock opname" /></div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-brand" id="adj-submit-btn" type="button">Submit Adjustment</button>
          <button class="btn btn-soft" id="adj-refresh-btn" type="button">Refresh Movements</button>
        </div>
        <div id="adj-msg"></div>
      </article>
      <article class="card" id="movement-list"></article>
    </section>

    <section id="route-stock-movement" class="route" data-route="/stock-movement">
      <h2 class="section-title">Stock Movement Explorer</h2>
      <article class="card form-grid">
        <div class="grid grid-4">
          <div><label>Inventory</label><select id="mv-filter-inventory"><option value="">Semua</option></select></div>
          <div><label>Type</label><select id="mv-filter-type"><option value="">Semua</option><option value="IN">IN</option><option value="OUT">OUT</option><option value="ADJUSTMENT">ADJUSTMENT</option></select></div>
          <div><label>From</label><input id="mv-filter-from" type="date" /></div>
          <div><label>To</label><input id="mv-filter-to" type="date" /></div>
        </div>
        <div class="grid grid-2">
          <div><label>Reference Search</label><input id="mv-filter-reference" placeholder="PO_RECEIVE, CAFE_PAY, ADJUSTMENT..." /></div>
          <div style="display:flex; gap:8px; align-items:flex-end;">
            <button class="btn btn-brand" id="mv-filter-apply-btn" type="button">Apply Filter</button>
            <button class="btn btn-line" id="mv-filter-reset-btn" type="button">Reset</button>
          </div>
        </div>
        <div id="mv-msg"></div>
      </article>
      <article class="card" id="mv-list"></article>
    </section>
  </main>

  <nav class="mobile-nav">
    <button type="button" data-nav="/customer">Beranda</button>
    <button type="button" data-nav="/reservation">Reservation</button>
    <button type="button" data-nav="/cafe">Cafe</button>
    <button type="button" data-nav="/kitchen">Kitchen</button>
    <button type="button" data-nav="/inventory">Inventory</button>
    <button type="button" data-nav="/ticketing">POS</button>
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

    class CustomerCrudService {
      async list() {
        const response = await fetch(API_BASE + "/api/customer", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat customer");
        return data;
      }

      async create(payload) {
        const response = await fetch(API_BASE + "/api/customer", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = response.status === 204 ? null : await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal menambah customer");
        return data;
      }

      async update(id, payload) {
        const response = await fetch(API_BASE + "/api/customer/" + encodeURIComponent(id), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = response.status === 204 ? null : await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memperbarui customer");
        return data;
      }

      async remove(id) {
        const response = await fetch(API_BASE + "/api/customer/" + encodeURIComponent(id), {
          method: "DELETE"
        });
        if (!response.ok) {
          const text = await response.text();
          let message = "Gagal menghapus customer";
          if (text) {
            try {
              const data = JSON.parse(text);
              message = data && data.error ? data.error : message;
            } catch {
              message = text;
            }
          }
          throw new Error(message);
        }
        return null;
      }
    }

    class PosTicketingService {
      async listTickets() {
        const response = await fetch(API_BASE + "/api/ticket", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat tiket");
        return Array.isArray(data) ? data : [];
      }

      async createSale(payload) {
        const response = await fetch(API_BASE + "/api/ticket-sale", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal membuat transaksi");
        return data;
      }

      async paySale(id, payload) {
        const response = await fetch(API_BASE + "/api/ticket-sale/" + encodeURIComponent(id) + "/pay", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memproses pembayaran");
        return data;
      }

      async getSale(id) {
        const response = await fetch(API_BASE + "/api/ticket-sale/" + encodeURIComponent(id), { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat transaksi");
        return data;
      }

      async printSale(id) {
        const response = await fetch(API_BASE + "/api/ticket-sale/" + encodeURIComponent(id) + "/print", { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal print ticket");
        return data;
      }

      async getQr(id) {
        const response = await fetch(API_BASE + "/api/ticket-sale/" + encodeURIComponent(id) + "/qr", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat QR");
        return data;
      }

      async getTicket(id) {
        const response = await fetch(API_BASE + "/api/ticket-sale/" + encodeURIComponent(id) + "/ticket", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat preview ticket");
        return data;
      }

      async checkIn(qrToken) {
        const response = await fetch(API_BASE + "/api/ticket-sale/checkin", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ qrToken })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal check-in");
        return data;
      }

      async voidSale(id) {
        const response = await fetch(API_BASE + "/api/ticket-sale/" + encodeURIComponent(id) + "/void", { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal void ticket");
        return data;
      }

      async getSummary() {
        const response = await fetch(API_BASE + "/api/ticket-sale/summary", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat summary");
        return data;
      }

      async getReport() {
        const response = await fetch(API_BASE + "/api/ticket-sale/report", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat report");
        return data;
      }
    }

    class CashierShiftClient {
      async open(payload) {
        const response = await fetch(API_BASE + "/api/cashier-shift/open", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal membuka shift");
        return data;
      }

      async close(payload) {
        const response = await fetch(API_BASE + "/api/cashier-shift/close", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal menutup shift");
        return data;
      }

      async current() {
        const response = await fetch(API_BASE + "/api/cashier-shift/current", { method: "GET" });
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat shift aktif");
        return data;
      }

      async summary() {
        const response = await fetch(API_BASE + "/api/cashier-shift/summary", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat summary shift");
        return data;
      }

      async history() {
        const response = await fetch(API_BASE + "/api/cashier-shift/history", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat history shift");
        return Array.isArray(data) ? data : [];
      }
    }

    class ReservationClient {
      async list() {
        const response = await fetch(API_BASE + "/api/reservation", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat reservation");
        return Array.isArray(data) ? data : [];
      }

      async create(payload) {
        const response = await fetch(API_BASE + "/api/reservation", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal membuat reservation");
        return data;
      }

      async getById(id) {
        const response = await fetch(API_BASE + "/api/reservation/" + encodeURIComponent(id), { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat detail reservation");
        return data;
      }

      async pay(id, paymentMethod) {
        const response = await fetch(API_BASE + "/api/reservation/" + encodeURIComponent(id) + "/pay", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ paymentMethod })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memproses payment reservation");
        return data;
      }

      async confirm(id) {
        const response = await fetch(API_BASE + "/api/reservation/" + encodeURIComponent(id) + "/confirm", { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal confirm reservation");
        return data;
      }

      async checkIn(id) {
        const response = await fetch(API_BASE + "/api/reservation/" + encodeURIComponent(id) + "/checkin", { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal check-in reservation");
        return data;
      }

      async cancel(id) {
        const response = await fetch(API_BASE + "/api/reservation/" + encodeURIComponent(id) + "/cancel", { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal cancel reservation");
        return data;
      }

      async qr(id) {
        const response = await fetch(API_BASE + "/api/reservation/" + encodeURIComponent(id) + "/qr", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat QR reservation");
        return data;
      }

      async report() {
        const response = await fetch(API_BASE + "/api/reservation/report", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat report reservation");
        return data;
      }
    }

    class ActivityClient {
      async listActivity() {
        const response = await fetch(API_BASE + "/api/activity", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat activity");
        return Array.isArray(data) ? data : [];
      }

      async createActivity(payload) {
        const response = await fetch(API_BASE + "/api/activity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = response.status === 204 ? null : await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal membuat activity");
        return data;
      }

      async updateActivity(id, payload) {
        const response = await fetch(API_BASE + "/api/activity/" + encodeURIComponent(id), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = response.status === 204 ? null : await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal update activity");
        return data;
      }

      async deleteActivity(id) {
        const response = await fetch(API_BASE + "/api/activity/" + encodeURIComponent(id), {
          method: "DELETE"
        });
        if (!response.ok) {
          const text = await response.text();
          let message = "Gagal delete activity";
          if (text) {
            try {
              const data = JSON.parse(text);
              message = data && data.error ? data.error : message;
            } catch {
              message = text;
            }
          }
          throw new Error(message);
        }
      }

      async listSchedule() {
        const response = await fetch(API_BASE + "/api/activity-schedule", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat schedule");
        return Array.isArray(data) ? data : [];
      }

      async createSchedule(payload) {
        const response = await fetch(API_BASE + "/api/activity-schedule", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal membuat schedule");
        return data;
      }

      async listBooking() {
        const response = await fetch(API_BASE + "/api/activity-booking", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat activity booking");
        return Array.isArray(data) ? data : [];
      }

      async createBooking(payload) {
        const response = await fetch(API_BASE + "/api/activity-booking", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal membuat activity booking");
        return data;
      }

      async payBooking(id, paymentMethod) {
        const response = await fetch(API_BASE + "/api/activity-booking/" + encodeURIComponent(id) + "/pay", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ paymentMethod })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal payment booking activity");
        return data;
      }

      async checkInBooking(id) {
        const response = await fetch(API_BASE + "/api/activity-booking/" + encodeURIComponent(id) + "/checkin", { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal check-in booking activity");
        return data;
      }

      async cancelBooking(id) {
        const response = await fetch(API_BASE + "/api/activity-booking/" + encodeURIComponent(id) + "/cancel", { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal cancel booking activity");
        return data;
      }

      async bookingReport() {
        const response = await fetch(API_BASE + "/api/activity-booking/report", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat report activity booking");
        return data;
      }

      async bookingQr(id) {
        const response = await fetch(API_BASE + "/api/activity-booking/" + encodeURIComponent(id) + "/qr", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat QR activity booking");
        return data;
      }
    }

    class CafeClient {
      async listCategory() {
        const response = await fetch(API_BASE + "/api/menu-category", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat kategori menu");
        return Array.isArray(data) ? data : [];
      }

      async createCategory(payload) {
        const response = await fetch(API_BASE + "/api/menu-category", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal membuat kategori menu");
        return data;
      }

      async listMenu() {
        const response = await fetch(API_BASE + "/api/menu-item", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat menu item");
        return Array.isArray(data) ? data : [];
      }

      async createMenu(payload) {
        const response = await fetch(API_BASE + "/api/menu-item", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal membuat menu item");
        return data;
      }

      async updateMenu(id, payload) {
        const response = await fetch(API_BASE + "/api/menu-item/" + encodeURIComponent(id), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal update menu item");
        return data;
      }

      async deleteMenu(id) {
        const response = await fetch(API_BASE + "/api/menu-item/" + encodeURIComponent(id), { method: "DELETE" });
        if (!response.ok) {
          const text = await response.text();
          let message = "Gagal delete menu item";
          if (text) {
            try {
              const data = JSON.parse(text);
              message = data && data.error ? data.error : message;
            } catch {
              message = text;
            }
          }
          throw new Error(message);
        }
      }

      async listOrder() {
        const response = await fetch(API_BASE + "/api/cafe-order", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat cafe order");
        return Array.isArray(data) ? data : [];
      }

      async createOrder(payload) {
        const response = await fetch(API_BASE + "/api/cafe-order", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal membuat cafe order");
        return data;
      }

      async payOrder(id, paymentMethod) {
        const response = await fetch(API_BASE + "/api/cafe-order/" + encodeURIComponent(id) + "/pay", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ paymentMethod })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal payment cafe order");
        return data;
      }

      async printOrder(id) {
        const response = await fetch(API_BASE + "/api/cafe-order/" + encodeURIComponent(id) + "/print", { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal print cafe order");
        return data;
      }

      async voidOrder(id) {
        const response = await fetch(API_BASE + "/api/cafe-order/" + encodeURIComponent(id) + "/void", { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal void cafe order");
        return data;
      }

      async summary() {
        const response = await fetch(API_BASE + "/api/cafe-order/summary", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat summary cafe order");
        return data;
      }

      async report() {
        const response = await fetch(API_BASE + "/api/cafe-order/report", { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Gagal memuat report cafe order");
        return data;
      }
    }

    class InventoryPurchasingClient {
      async listSupplier() { return this.get("/api/supplier"); }
      async createSupplier(payload) { return this.post("/api/supplier", payload); }

      async listInventory() { return this.get("/api/inventory"); }
      async createInventory(payload) { return this.post("/api/inventory", payload); }
      async inventoryReport() { return this.get("/api/inventory/report"); }
      async inventoryDashboard() { return this.get("/api/inventory/dashboard"); }
      async stockAdjustment(payload) { return this.post("/api/inventory/stock-adjustment", payload); }

      async listPurchaseOrder() { return this.get("/api/purchase-order"); }
      async getPurchaseOrderById(id) { return this.get("/api/purchase-order/" + encodeURIComponent(id)); }
      async createPurchaseOrder(payload) { return this.post("/api/purchase-order", payload); }
      async approvePurchaseOrder(id) { return this.post("/api/purchase-order/" + encodeURIComponent(id) + "/approve", {}); }
      async receivePurchaseOrder(id) { return this.post("/api/purchase-order/" + encodeURIComponent(id) + "/receive", {}); }
      async cancelPurchaseOrder(id, payload = {}) { return this.post("/api/purchase-order/" + encodeURIComponent(id) + "/cancel", payload); }

      async listRecipe() { return this.get("/api/recipe"); }
      async upsertRecipe(menuId, payload) { return this.post("/api/recipe/menu/" + encodeURIComponent(menuId), payload); }
      async listStockMovement(filters = {}) {
        const params = new URLSearchParams();
        if (filters.inventoryId) params.set("inventoryId", filters.inventoryId);
        if (filters.movementType) params.set("movementType", filters.movementType);
        if (filters.reference) params.set("reference", filters.reference);
        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);
        const qs = params.toString();
        return this.get("/api/stock-movement" + (qs ? "?" + qs : ""));
      }

      async get(path) {
        const response = await fetch(API_BASE + path, { method: "GET" });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Request gagal");
        return data;
      }

      async post(path, payload) {
        const response = await fetch(API_BASE + path, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data && data.error ? data.error : "Request gagal");
        return data;
      }
    }

    const apiClient = new ApiClient();
    const customerService = new CustomerService(apiClient);
    const customerCrudService = new CustomerCrudService();
    const posTicketingService = new PosTicketingService();
    const cashierShiftClient = new CashierShiftClient();
    const reservationClient = new ReservationClient();
    const activityClient = new ActivityClient();
    const cafeClient = new CafeClient();
    const inventoryPurchasingClient = new InventoryPurchasingClient();
    const bookingService = new BookingService(apiClient);
    const paymentService = new PaymentService(apiClient);
    const profileService = new ProfileService(customerService);

    const wizardStepLabels = [
      "01 Produk",
      "02 Tanggal",
      "03 Jumlah",
      "04 Kontak",
      "05 Review & Bayar"
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
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        latestQuote: null,
        availability: []
      },
      lastTicket: null,
      customerCrud: {
        editingId: "",
        list: []
      },
      pos: {
        tickets: [],
        activeCategory: "Semua",
        selectedTicketId: "",
        items: [],
        currentSaleId: "",
        currentPreview: null
      },
      cashier: {
        current: null,
        summary: null,
        history: []
      },
      reservation: {
        rows: [],
        items: [],
        currentId: "",
        currentDetail: null
      },
      activity: {
        rows: [],
        schedules: [],
        bookings: [],
        currentActivityId: "",
        currentBookingId: "",
        currentBooking: null
      },
      cafe: {
        categories: [],
        menus: [],
        activeCategory: "Semua",
        selectedMenuId: "",
        selectedTable: "01",
        orders: [],
        cart: [],
        currentOrderId: "",
        currentOrder: null,
        receipt: ""
      },
      inventoryOps: {
        suppliers: [],
        inventories: [],
        purchaseOrders: [],
        purchaseDetail: null,
        recipes: [],
        movements: [],
        movementFilters: {
          inventoryId: "",
          movementType: "",
          reference: "",
          from: "",
          to: ""
        },
        poItems: [],
        recipeItems: []
      }
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

    function resolveProductImage(item) {
      const source = item && (item.imageUrl || item.image || item.thumbnail || item.photoUrl || item.photo || item.bannerUrl);
      return source ? String(source) : "";
    }

    function resolveCategory(item, fallback) {
      return String((item && (item.category || item.categoryName || item.type || item.group)) || fallback || "General");
    }

    function availabilityTone(value) {
      const amount = Number(value || 0);
      if (amount <= 0) return "full";
      if (amount <= 5) return "low";
      return "ok";
    }

    function renderProductCard(config) {
      const img = config.image || "";
      const badgeTone = availabilityTone(config.availabilityValue);
      const badgeClass = badgeTone === "full" ? "availability-badge full" : badgeTone === "low" ? "availability-badge low" : "availability-badge";
      const icon = config.placeholderIcon || "SATSET";
      return ''
        + '<article class="product-card' + (config.selected ? ' selected' : '') + '">'
        + '<div class="product-figure">'
        + (img
          ? '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(config.name) + '" loading="lazy" onerror="this.parentElement.classList.add(&quot;is-fallback&quot;)" /><span class="img-fallback">' + escapeHtml(icon) + '</span>'
          : '<span class="img-fallback">' + escapeHtml(icon) + '</span>')
        + '</div>'
        + '<div class="product-body">'
        + '<h4 class="product-name">' + escapeHtml(config.name) + '</h4>'
        + (config.subtitle ? '<p class="product-subtitle">' + escapeHtml(config.subtitle) + '</p>' : '')
        + '<div class="product-meta"><strong class="product-price">' + escapeHtml(formatCurrency(config.price || 0)) + '</strong>'
        + '<span class="' + badgeClass + '">' + escapeHtml(config.availabilityLabel || "") + '</span></div>'
        + (config.categoryLabel ? '<div><span class="category-badge">' + escapeHtml(config.categoryLabel) + '</span></div>' : '')
        + '<div class="product-actions">'
        + (config.qtyInputId ? '<input class="qty-pill" id="' + escapeHtml(config.qtyInputId) + '" type="number" min="1" value="1" />' : '')
        + '<button type="button" class="btn btn-soft" ' + escapeHtml(config.actionAttr) + '="' + escapeHtml(config.actionValue) + '">' + escapeHtml(config.actionLabel || "Tambah") + '</button>'
        + '</div>'
        + '</div>'
        + '</article>';
    }

    function renderEmptyState(title, description, badge) {
      return ''
        + '<div class="empty-state">'
        + (badge ? '<span class="empty-state-badge">' + escapeHtml(badge) + '</span>' : '')
        + '<strong>' + escapeHtml(title) + '</strong>'
        + '<p>' + escapeHtml(description) + '</p>'
        + '</div>';
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
      if (p.startsWith("/ticket-preview/")) return "/ticket-preview";
      if (p.startsWith("/purchase/")) return "/purchase/:id";
      if (p.startsWith("/reservation/")) return "/reservation/:id";
      if (p.startsWith("/reservation")) return "/reservation";
      if (p.startsWith("/kitchen")) return "/kitchen";
      if (p.startsWith("/cafe")) return "/cafe";
      if (p.startsWith("/inventory")) return "/inventory";
      if (p.startsWith("/supplier")) return "/supplier";
      if (p.startsWith("/purchase")) return "/purchase";
      if (p.startsWith("/recipe")) return "/recipe";
      if (p.startsWith("/stock-adjustment")) return "/stock-adjustment";
      if (p.startsWith("/stock-movement")) return "/stock-movement";
      if (p.startsWith("/activity-booking")) return "/activity-booking";
      if (p.startsWith("/activities")) return "/activities";
      if (p.startsWith("/ticketing")) return "/ticketing";
      if (p.startsWith("/cashier")) return "/cashier";
      if (p.startsWith("/gate")) return "/gate";
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
      if (path === "/customer") {
        loadLandingNotifications();
        loadCustomerCrud();
      }
      if (path === "/ticketing") {
        loadPosTicketing();
      }
      if (path === "/reservation") {
        loadReservationPage();
      }
      if (path === "/activities") {
        loadActivitiesPage();
      }
      if (path === "/activity-booking") {
        loadActivityBookingPage();
      }
      if (path === "/cafe") {
        loadCafePage();
      }
      if (path === "/kitchen") {
        loadKitchenPage();
      }
      if (path === "/supplier") {
        loadSupplierPage();
      }
      if (path === "/inventory") {
        loadInventoryPage();
      }
      if (path === "/purchase") {
        loadPurchasePage();
      }
      if (path === "/purchase/:id") {
        const id = location.pathname.split("/").pop();
        if (id) loadPurchaseDetail(id);
      }
      if (path === "/recipe") {
        loadRecipePage();
      }
      if (path === "/stock-adjustment") {
        loadStockAdjustmentPage();
      }
      if (path === "/stock-movement") {
        loadStockMovementPage();
      }
      if (path === "/cashier") {
        loadCashierPage();
      }
      if (path === "/reservation/:id") {
        const id = location.pathname.split("/").pop();
        if (id) loadReservationDetail(id);
      }
      if (path === "/ticket-preview") {
        const id = location.pathname.split("/").pop();
        if (id) loadTicketPreview(id);
      }
      if (path === "/gate") {
        resetGatePanel();
      }
      if (path === "/customer/ticket") {
        const id = location.pathname.split("/").pop();
        if (id) loadTicket(id);
      }
    }

    function resetCustomerCrudForm() {
      document.getElementById("crud-code").value = "";
      document.getElementById("crud-full-name").value = "";
      document.getElementById("crud-email").value = "";
      document.getElementById("crud-phone").value = "";
      state.customerCrud.editingId = "";
      document.getElementById("crud-submit").textContent = "Tambah Customer";
      document.getElementById("crud-cancel-edit").style.display = "none";
    }

    function renderCustomerCrudList() {
      const wrap = document.getElementById("crud-customer-list");
      const rows = state.customerCrud.list || [];
      if (!rows.length) {
        wrap.innerHTML = '<div class="notice warn">Belum ada customer.</div>';
        return;
      }

      const tableRows = rows.map((item) =>
        '<tr>' +
          '<td>' + escapeHtml(item.code) + '</td>' +
          '<td>' + escapeHtml(item.fullName) + '</td>' +
          '<td>' + escapeHtml(item.email) + '</td>' +
          '<td>' + escapeHtml(item.phone || '-') + '</td>' +
          '<td style="display:flex; gap:6px; flex-wrap:wrap;">' +
            '<button type="button" class="btn btn-soft" data-crud-edit="' + escapeHtml(item.id) + '">Edit</button>' +
            '<button type="button" class="btn btn-line" data-crud-delete="' + escapeHtml(item.id) + '">Hapus</button>' +
          '</td>' +
        '</tr>'
      ).join("");

      wrap.innerHTML =
        '<div style="overflow:auto;">' +
          '<table style="width:100%; border-collapse:collapse;">' +
            '<thead><tr><th align="left">Kode</th><th align="left">Nama</th><th align="left">Email</th><th align="left">Telepon</th><th align="left">Aksi</th></tr></thead>' +
            '<tbody>' + tableRows + '</tbody>' +
          '</table>' +
        '</div>';

      wrap.querySelectorAll("[data-crud-edit]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-crud-edit") || "";
          const found = rows.find((item) => item.id === id);
          if (!found) return;
          state.customerCrud.editingId = found.id;
          document.getElementById("crud-code").value = found.code || "";
          document.getElementById("crud-full-name").value = found.fullName || "";
          document.getElementById("crud-email").value = found.email || "";
          document.getElementById("crud-phone").value = found.phone || "";
          document.getElementById("crud-submit").textContent = "Simpan Perubahan";
          document.getElementById("crud-cancel-edit").style.display = "inline-flex";
        });
      });

      wrap.querySelectorAll("[data-crud-delete]").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.getAttribute("data-crud-delete") || "";
          if (!id) return;
          try {
            await customerCrudService.remove(id);
            showMessage("crud-customer-msg", "Customer berhasil dihapus", "ok");
            await loadCustomerCrud();
            if (state.customerCrud.editingId === id) resetCustomerCrudForm();
          } catch (error) {
            showMessage("crud-customer-msg", error.message, "err");
          }
        });
      });
    }

    async function loadCustomerCrud() {
      try {
        const result = await customerCrudService.list();
        state.customerCrud.list = Array.isArray(result.data) ? result.data : [];
        renderCustomerCrudList();
      } catch (error) {
        showMessage("crud-customer-msg", error.message, "err");
      }
    }

    function recalculatePos() {
      const subtotal = state.pos.items.reduce((sum, item) => sum + item.total, 0);
      const discount = Math.max(0, Number(document.getElementById("pos-discount").value || 0));
      const tax = Math.max(0, Number(document.getElementById("pos-tax").value || 0));
      const total = Math.max(0, subtotal - discount + tax);
      const paidAmount = Math.max(0, Number(document.getElementById("pos-paid-amount").value || 0));
      const paymentMethod = document.getElementById("pos-payment-method").value;
      const changeAmount = paymentMethod === "CASH" ? Math.max(0, paidAmount - total) : 0;

      document.getElementById("pos-subtotal").value = String(subtotal);
      document.getElementById("pos-total").value = String(total);
      document.getElementById("pos-change-amount").value = String(changeAmount);
      const subtotalText = document.getElementById("pos-subtotal-text");
      const totalText = document.getElementById("pos-total-text");
      if (subtotalText) subtotalText.textContent = formatCurrency(subtotal);
      if (totalText) totalText.textContent = formatCurrency(total);

      return { subtotal, discount, tax, total, paidAmount, changeAmount, paymentMethod };
    }

    function renderPosCategoryTabs() {
      const root = document.getElementById("pos-category-tabs");
      const rows = state.pos.tickets || [];
      const categories = ["Semua"].concat(Array.from(new Set(rows.map((item) => resolveCategory(item, "General")))));
      if (!categories.includes(state.pos.activeCategory)) {
        state.pos.activeCategory = "Semua";
      }
      root.innerHTML = categories.map((category) => {
        const active = state.pos.activeCategory === category;
        return '<button type="button" class="tab-btn ' + (active ? 'active' : '') + '" data-pos-category="' + escapeHtml(category) + '">' + escapeHtml(category) + '</button>';
      }).join('');
    }

    function renderPosTicketCatalog() {
      const root = document.getElementById("pos-ticket-catalog");
      const all = state.pos.tickets.filter((item) => item.active);
      const rows = all.filter((item) => state.pos.activeCategory === "Semua" || resolveCategory(item, "General") === state.pos.activeCategory);
      if (!rows.length) {
        root.innerHTML = renderEmptyState("Belum ada tiket pada kategori ini", "Pilih kategori lain atau refresh data tiket untuk memuat katalog terbaru.", "Katalog Kosong");
        return;
      }
      root.innerHTML = rows.map((item) => {
        const qtyId = 'pos-qty-' + escapeHtml(item.id);
        const category = resolveCategory(item, "Tiket Masuk");
        return renderProductCard({
          image: resolveProductImage(item),
          name: item.name + ' (' + item.code + ')',
          subtitle: item.description || item.summary || '',
          price: item.price || 0,
          availabilityValue: item.quota,
          availabilityLabel: item.quota > 0 ? ('Sisa ' + item.quota) : 'Habis',
          categoryLabel: category,
          placeholderIcon: 'TIKET',
          qtyInputId: qtyId,
          selected: state.pos.selectedTicketId === item.id,
          actionAttr: 'data-pos-ticket-add',
          actionValue: item.id,
          actionLabel: '+'
        });
      }).join('');
    }

    function renderPosItems() {
      const root = document.getElementById("pos-items");
      const countRoot = document.getElementById("pos-order-count");
      const totalQty = state.pos.items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      if (countRoot) countRoot.textContent = totalQty + ' item';
      if (!state.pos.items.length) {
        root.innerHTML = renderEmptyState("Keranjang tiket masih kosong", "Pilih tiket dari katalog untuk mulai membuat transaksi wisata.", "0 Item");
        recalculatePos();
        return;
      }

      root.innerHTML = state.pos.items.map((item, index) => (
        '<article class="order-item">'
          + '<div class="order-item-top"><strong>' + escapeHtml(item.ticketName) + '</strong><button type="button" class="btn btn-line" data-pos-remove="' + String(index) + '">Hapus</button></div>'
          + '<small>' + escapeHtml(item.qty) + ' x ' + escapeHtml(formatCurrency(item.price)) + '</small>'
          + '<strong>' + escapeHtml(formatCurrency(item.total)) + '</strong>'
        + '</article>'
      )).join("");

      root.querySelectorAll("[data-pos-remove]").forEach((button) => {
        button.addEventListener("click", () => {
          const idx = Number(button.getAttribute("data-pos-remove") || -1);
          if (idx < 0) return;
          state.pos.items.splice(idx, 1);
          renderPosItems();
        });
      });

      recalculatePos();
    }

    function renderPosTicketOptions() {
      const select = document.getElementById("pos-ticket-select");
      const activeTickets = state.pos.tickets.filter((item) => item.active && item.quota > 0);
      select.innerHTML = activeTickets.map((item) => (
        '<option value="' + escapeHtml(item.id) + '">' +
        escapeHtml(item.name) + ' (' + escapeHtml(item.code) + ') - ' + escapeHtml(formatCurrency(item.price)) + ' | Quota ' + escapeHtml(item.quota) +
        '</option>'
      )).join("");

      if (!activeTickets.length) {
        showMessage("pos-msg", "Tidak ada tiket aktif dengan quota tersedia", "warn");
      }
      renderPosCategoryTabs();
      renderPosTicketCatalog();
    }

    async function loadPosTicketing() {
      try {
        state.pos.tickets = await posTicketingService.listTickets();
        renderPosTicketOptions();
        renderPosItems();
      } catch (error) {
        showMessage("pos-msg", error.message, "err");
      }
    }

    function renderReservationTicketOptions() {
      const select = document.getElementById("reservation-ticket-select");
      const activeTickets = state.pos.tickets.filter((item) => item.active && item.quota > 0);
      select.innerHTML = activeTickets.map((item) => (
        '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + ' (' + escapeHtml(item.code) + ') - ' + escapeHtml(formatCurrency(item.price)) + ' | Quota ' + escapeHtml(item.quota) + '</option>'
      )).join("");
      if (!activeTickets.length) {
        showMessage("reservation-msg", "Tidak ada tiket aktif dengan quota tersedia", "warn");
      }
    }

    function renderReservationItems() {
      const root = document.getElementById("reservation-items");
      if (!state.reservation.items.length) {
        root.innerHTML = '<div class="notice warn">Belum ada ticket item pada booking.</div>';
        return;
      }

      const rows = state.reservation.items.map((item, index) => (
        '<tr>' +
          '<td>' + escapeHtml(item.ticketName) + '</td>' +
          '<td>' + escapeHtml(item.qty) + '</td>' +
          '<td>' + escapeHtml(formatCurrency(item.price)) + '</td>' +
          '<td>' + escapeHtml(formatCurrency(item.total)) + '</td>' +
          '<td><button type="button" class="btn btn-line" data-res-item-remove="' + String(index) + '">Hapus</button></td>' +
        '</tr>'
      )).join("");

      root.innerHTML =
        '<div style="overflow:auto;">' +
          '<table style="width:100%; border-collapse:collapse;">' +
            '<thead><tr><th align="left">Ticket</th><th align="left">Qty</th><th align="left">Harga</th><th align="left">Total</th><th align="left">Aksi</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>';

      root.querySelectorAll("[data-res-item-remove]").forEach((button) => {
        button.addEventListener("click", () => {
          const idx = Number(button.getAttribute("data-res-item-remove") || -1);
          if (idx < 0) return;
          state.reservation.items.splice(idx, 1);
          renderReservationItems();
        });
      });
    }

    function renderReservationList() {
      const root = document.getElementById("reservation-list");
      const rows = state.reservation.rows || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Belum ada reservation.</div>';
        return;
      }

      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Booking</th><th align="left">Customer</th><th align="left">Visit</th><th align="left">Payment</th><th align="left">Status</th><th align="left">Total</th><th align="left">Aksi</th></tr></thead>'
        + '<tbody>' + rows.map((item) => (
          '<tr>'
          + '<td>' + escapeHtml(item.bookingNumber) + '</td>'
          + '<td>' + escapeHtml(item.customerName) + '</td>'
          + '<td>' + escapeHtml(item.visitDate) + ' ' + escapeHtml(item.visitSession) + '</td>'
          + '<td><span class="status-pill status-' + escapeHtml(item.paymentStatus) + '">' + escapeHtml(item.paymentStatus) + '</span></td>'
          + '<td><span class="status-pill status-' + escapeHtml(item.reservationStatus) + '">' + escapeHtml(item.reservationStatus) + '</span></td>'
          + '<td>' + escapeHtml(formatCurrency(item.totalAmount || 0)) + '</td>'
          + '<td style="display:flex; gap:6px; flex-wrap:wrap;">'
          + '<button type="button" class="btn btn-soft" data-res-detail="' + escapeHtml(item.id) + '">Detail</button>'
          + '</td>'
          + '</tr>'
        )).join('') + '</tbody></table></div>';

      root.querySelectorAll("[data-res-detail]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-res-detail") || "";
          if (!id) return;
          navigate("/reservation/" + id);
        });
      });
    }

    function renderReservationTimeline(detail) {
      const root = document.getElementById("reservation-status-timeline");
      const steps = [
        { key: "WAITING_PAYMENT", label: "WAITING_PAYMENT" },
        { key: "PAID", label: "PAID" },
        { key: "CONFIRMED", label: "CONFIRMED" },
        { key: "CHECKED_IN", label: "CHECKED_IN" },
        { key: "COMPLETED", label: "COMPLETED" }
      ];
      const current = detail.reservationStatus || "NEW";
      const cancelled = current === "CANCELLED" || current === "VOID";
      const currentIndex = steps.findIndex((step) => step.key === current);

      root.innerHTML = '<h3 style="margin:0 0 10px;">Status Timeline</h3>'
        + '<div style="display:grid; gap:8px;">'
        + steps.map((step, index) => {
          const done = !cancelled && index <= currentIndex;
          return '<div style="border:1px solid var(--border); border-radius:10px; padding:10px; background:' + (done ? '#ecfdf3' : '#ffffff') + ';">'
            + '<strong>' + step.label + '</strong>'
            + '<div style="font-size:12px; color:var(--muted);">' + (done ? 'done' : 'pending') + '</div>'
            + '</div>';
        }).join('')
        + (cancelled ? '<div class="notice warn">Reservation CANCELLED</div>' : '')
        + '</div>';
    }

    async function loadReservationPage() {
      try {
        if (!state.pos.tickets.length) {
          state.pos.tickets = await posTicketingService.listTickets();
        }
        state.reservation.rows = await reservationClient.list();
        renderReservationTicketOptions();
        renderReservationItems();
        renderReservationList();
      } catch (error) {
        showMessage("reservation-msg", error.message, "err");
      }
    }

    async function loadReservationDetail(id) {
      try {
        const detail = await reservationClient.getById(id);
        const qr = await reservationClient.qr(id);
        state.reservation.currentId = id;
        state.reservation.currentDetail = detail;

        document.getElementById("reservation-detail-meta").innerHTML =
          '<div><strong>Booking Number:</strong> ' + escapeHtml(detail.bookingNumber) + '</div>' +
          '<div><strong>Customer:</strong> ' + escapeHtml(detail.customerName) + ' (' + escapeHtml(detail.customerPhone) + ')</div>' +
          '<div><strong>Email:</strong> ' + escapeHtml(detail.customerEmail) + '</div>' +
          '<div><strong>Visit:</strong> ' + escapeHtml(detail.visitDate) + ' ' + escapeHtml(detail.visitSession) + '</div>' +
          '<div><strong>Total Visitor:</strong> ' + escapeHtml(detail.totalVisitor) + '</div>' +
          '<div><strong>Total Amount:</strong> ' + escapeHtml(formatCurrency(detail.totalAmount || 0)) + '</div>' +
          '<div><strong>Payment:</strong> <span class="status-pill status-' + escapeHtml(detail.paymentStatus) + '">' + escapeHtml(detail.paymentStatus) + '</span></div>' +
          '<div><strong>Reservation Status:</strong> <span class="status-pill status-' + escapeHtml(detail.reservationStatus) + '">' + escapeHtml(detail.reservationStatus) + '</span></div>';

        document.getElementById("reservation-detail-qr").innerHTML = safeQrSvg(qr.svg) || "QR belum tersedia";
        renderReservationTimeline(detail);
      } catch (error) {
        showMessage("reservation-detail-msg", error.message, "err");
      }
    }

    function renderActivitySelectOptions() {
      const select = document.getElementById("ab-activity-select");
      const rows = state.activity.rows || [];
      select.innerHTML = rows.map((item) => (
        '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + ' - ' + escapeHtml(formatCurrency(item.price)) + ' | cap ' + escapeHtml(item.capacity) + '</option>'
      )).join("");
      if (!state.activity.currentActivityId && rows.length) {
        state.activity.currentActivityId = rows[0].id;
      }
      if (state.activity.currentActivityId) {
        select.value = state.activity.currentActivityId;
      }
      const root = document.getElementById("ab-activity-catalog");
      if (root) {
        root.innerHTML = rows.map((item) => {
          const schedules = (state.activity.schedules || []).filter((row) => row.activityId === item.id);
          const available = schedules.reduce((sum, row) => sum + Number(row.available || 0), 0);
          return renderProductCard({
            image: resolveProductImage(item),
            name: item.name,
            subtitle: item.duration ? (item.duration + ' menit') : '',
            price: item.price || 0,
            availabilityValue: available,
            availabilityLabel: available > 0 ? ('Available ' + available) : 'Penuh',
            categoryLabel: resolveCategory(item, "Outbound"),
            placeholderIcon: 'OUTBOUND',
            selected: state.activity.currentActivityId === item.id,
            actionAttr: 'data-ab-activity',
            actionValue: item.id,
            actionLabel: state.activity.currentActivityId === item.id ? 'Dipilih' : 'Pilih'
          });
        }).join("");
      }
    }

    function renderActivityList() {
      const root = document.getElementById("activity-list");
      const rows = state.activity.rows || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Belum ada aktivitas.</div>';
        return;
      }

      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Code</th><th align="left">Name</th><th align="left">Category</th><th align="left">Duration</th><th align="left">Capacity</th><th align="left">Price</th><th align="left">Active</th><th align="left">Aksi</th></tr></thead>'
        + '<tbody>' + rows.map((item) => (
          '<tr>'
          + '<td>' + escapeHtml(item.code) + '</td>'
          + '<td>' + escapeHtml(item.name) + '</td>'
          + '<td>' + escapeHtml(item.category) + '</td>'
          + '<td>' + escapeHtml(item.duration) + 'm</td>'
          + '<td>' + escapeHtml(item.capacity) + '</td>'
          + '<td>' + escapeHtml(formatCurrency(item.price || 0)) + '</td>'
          + '<td>' + (item.active ? "true" : "false") + '</td>'
          + '<td style="display:flex; gap:6px; flex-wrap:wrap;">'
          + '<button type="button" class="btn btn-soft" data-activity-edit="' + escapeHtml(item.id) + '">Edit</button>'
          + '<button type="button" class="btn btn-line" data-activity-delete="' + escapeHtml(item.id) + '">Delete</button>'
          + '</td>'
          + '</tr>'
        )).join('') + '</tbody></table></div>';

      root.querySelectorAll("[data-activity-edit]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-activity-edit") || "";
          const item = rows.find((row) => row.id === id);
          if (!item) return;
          document.getElementById("activity-code").value = item.code || "";
          document.getElementById("activity-name").value = item.name || "";
          document.getElementById("activity-category").value = item.category || "";
          document.getElementById("activity-duration").value = String(item.duration || 60);
          document.getElementById("activity-capacity").value = String(item.capacity || 20);
          document.getElementById("activity-price").value = String(item.price || 0);
          document.getElementById("activity-active").value = String(Boolean(item.active));
          document.getElementById("activity-create-btn").setAttribute("data-edit-id", id);
          document.getElementById("activity-create-btn").textContent = "Update Activity";
        });
      });

      root.querySelectorAll("[data-activity-delete]").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.getAttribute("data-activity-delete") || "";
          if (!id) return;
          try {
            await activityClient.deleteActivity(id);
            showMessage("activity-msg", "Activity dihapus", "warn");
            await loadActivitiesPage();
          } catch (error) {
            showMessage("activity-msg", error.message, "err");
          }
        });
      });
    }

    function renderActivityScheduleOptions() {
      const activityId = document.getElementById("ab-activity-select").value;
      state.activity.currentActivityId = activityId || state.activity.currentActivityId;
      const select = document.getElementById("ab-schedule-select");
      const schedules = (state.activity.schedules || []).filter((item) => item.activityId === activityId);
      select.innerHTML = schedules.map((item) => (
        '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.date) + ' ' + escapeHtml(item.session) + ' | available ' + escapeHtml(item.available) + '</option>'
      )).join("");
      if (!schedules.length) {
        select.innerHTML = "";
      } else if (!select.value) {
        select.value = schedules[0].id;
      }

      const selectedSchedule = schedules.find((item) => item.id === select.value);
      const scheduleInfo = document.getElementById("ab-selected-schedule");
      if (scheduleInfo) {
        scheduleInfo.textContent = selectedSchedule
          ? ("Jadwal: " + selectedSchedule.date + " " + selectedSchedule.session + " | Slot tersedia: " + selectedSchedule.available)
          : "Jadwal: belum dipilih";
      }

      const cardRoot = document.getElementById("ab-schedule-cards");
      if (cardRoot) {
        if (!schedules.length) {
          cardRoot.innerHTML = renderEmptyState("Belum ada jadwal tersedia", "Pilih aktivitas lain atau buat jadwal baru untuk melanjutkan pemesanan outbound.", "Jadwal");
          return;
        }
        cardRoot.innerHTML = schedules.map((item) => {
          const isSelected = select.value === item.id;
          return ''
            + '<article class="product-card' + (isSelected ? ' selected' : '') + '">'
            + '<div class="product-figure"><span>' + escapeHtml(item.session || "SESSION") + '</span></div>'
            + '<div class="product-body">'
            + '<h4 class="product-name">' + escapeHtml(item.date) + '</h4>'
            + '<p class="product-subtitle">Jam ' + escapeHtml(item.session || '-') + ' • Kapasitas ' + escapeHtml(item.capacity || '-') + '</p>'
            + '<div class="product-meta"><strong>Booked ' + escapeHtml(item.booked) + '</strong><span class="' + (availabilityTone(item.available) === 'full' ? 'availability-badge full' : availabilityTone(item.available) === 'low' ? 'availability-badge low' : 'availability-badge') + '">Sisa ' + escapeHtml(item.available) + '</span></div>'
            + '<div class="product-actions"><button type="button" class="btn ' + (isSelected ? 'btn-brand' : 'btn-line') + '" data-ab-schedule="' + escapeHtml(item.id) + '">' + (isSelected ? 'Aktif' : 'Pilih Jadwal') + '</button></div>'
            + '</div>'
            + '</article>';
        }).join('');
      }
    }

    function renderActivityScheduleList() {
      const root = document.getElementById("ab-schedule-list");
      const schedules = state.activity.schedules || [];
      if (!schedules.length) {
        root.innerHTML = '<div class="notice warn">Belum ada schedule activity.</div>';
        return;
      }

      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Date</th><th align="left">Session</th><th align="left">Capacity</th><th align="left">Booked</th><th align="left">Available</th></tr></thead>'
        + '<tbody>' + schedules.map((item) => (
          '<tr>'
          + '<td>' + escapeHtml(item.date) + '</td>'
          + '<td>' + escapeHtml(item.session) + '</td>'
          + '<td>' + escapeHtml(item.capacity) + '</td>'
          + '<td>' + escapeHtml(item.booked) + '</td>'
          + '<td>' + escapeHtml(item.available) + '</td>'
          + '</tr>'
        )).join('') + '</tbody></table></div>';
    }

    function renderActivityBookingTimeline(item) {
      const root = document.getElementById("ab-timeline");
      if (!item) {
        root.innerHTML = '<div class="notice warn">Belum ada booking dipilih.</div>';
        return;
      }

      const steps = ["WAITING_PAYMENT", "CONFIRMED", "CHECKED_IN", "COMPLETED"];
      const current = item.status || "WAITING_PAYMENT";
      const cancelled = current === "CANCELLED";
      const currentIndex = steps.indexOf(current);
      root.innerHTML = '<div style="display:grid; gap:8px;">'
        + steps.map((step, idx) => {
          const done = !cancelled && idx <= currentIndex;
          return '<div style="border:1px solid var(--border); border-radius:10px; padding:10px; background:' + (done ? '#ecfdf3' : '#ffffff') + ';">'
            + '<strong>' + escapeHtml(step) + '</strong>'
            + '<div style="font-size:12px; color:var(--muted);">' + (done ? 'done' : 'pending') + '</div>'
            + '</div>';
        }).join("")
        + (cancelled ? '<div class="notice warn">Booking CANCELLED</div>' : '')
        + '</div>';
    }

    function renderActivityBookingList() {
      const root = document.getElementById("ab-booking-list");
      const rows = state.activity.bookings || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Belum ada activity booking.</div>';
        return;
      }

      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Booking</th><th align="left">Customer</th><th align="left">Qty</th><th align="left">Total</th><th align="left">Status</th><th align="left">Aksi</th></tr></thead>'
        + '<tbody>' + rows.map((item) => (
          '<tr>'
          + '<td>' + escapeHtml(item.bookingNumber) + '</td>'
          + '<td>' + escapeHtml(item.customerName) + '</td>'
          + '<td>' + escapeHtml(item.qty) + '</td>'
          + '<td>' + escapeHtml(formatCurrency(item.total || 0)) + '</td>'
          + '<td><span class="status-pill status-' + escapeHtml(item.status) + '">' + escapeHtml(item.status) + '</span></td>'
          + '<td><button type="button" class="btn btn-soft" data-ab-detail="' + escapeHtml(item.id) + '">Pilih</button></td>'
          + '</tr>'
        )).join('') + '</tbody></table></div>';

      root.querySelectorAll("[data-ab-detail]").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.getAttribute("data-ab-detail") || "";
          const current = rows.find((row) => row.id === id);
          if (!current) return;
          state.activity.currentBookingId = id;
          state.activity.currentBooking = current;
          document.getElementById("ab-status").value = current.status || "WAITING_PAYMENT";
          try {
            const qr = await activityClient.bookingQr(id);
            document.getElementById("ab-qr").innerHTML = safeQrSvg(qr.svg) || "QR belum tersedia";
          } catch (error) {
            showMessage("ab-msg", error.message, "err");
          }
          renderActivityBookingTimeline(current);
        });
      });
    }

    async function loadActivitiesPage() {
      try {
        state.activity.rows = await activityClient.listActivity();
        renderActivityList();
        renderActivitySelectOptions();
      } catch (error) {
        showMessage("activity-msg", error.message, "err");
      }
    }

    async function loadActivityBookingPage() {
      try {
        if (!state.activity.rows.length) {
          state.activity.rows = await activityClient.listActivity();
        }
        state.activity.schedules = await activityClient.listSchedule();
        state.activity.bookings = await activityClient.listBooking();
        renderActivitySelectOptions();
        renderActivityScheduleOptions();
        renderActivityScheduleList();
        renderActivityBookingList();
        renderActivityBookingTimeline(state.activity.currentBooking);
      } catch (error) {
        showMessage("ab-msg", error.message, "err");
      }
    }

    function renderCafeCategoryOptions() {
      const categorySelect = document.getElementById("cafe-menu-category");
      const categories = state.cafe.categories || [];
      categorySelect.innerHTML = categories.map((item) => (
        '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + ' (' + escapeHtml(item.code) + ')</option>'
      )).join("");
      const tabRoot = document.getElementById("cafe-category-tabs");
      const tabItems = [{ id: "Semua", name: "Semua" }].concat(categories.map((item) => ({ id: item.id, name: item.name })));
      if (!tabItems.some((item) => item.id === state.cafe.activeCategory)) {
        state.cafe.activeCategory = "Semua";
      }
      if (tabRoot) {
        tabRoot.innerHTML = tabItems.map((item) => {
          const active = state.cafe.activeCategory === item.id;
          return '<button type="button" class="tab-btn ' + (active ? 'active' : '') + '" data-cafe-category="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + '</button>';
        }).join('');
      }
    }

    function renderCafeMenuOptions() {
      const select = document.getElementById("cafe-order-menu");
      const menus = (state.cafe.menus || []).filter((item) => item.active && item.stock > 0 && (state.cafe.activeCategory === "Semua" || item.categoryId === state.cafe.activeCategory));
      select.innerHTML = menus.map((item) => (
        '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + ' - ' + escapeHtml(formatCurrency(item.price || 0)) + ' | stock ' + escapeHtml(item.stock) + '</option>'
      )).join("");
      if (!menus.length) {
        select.innerHTML = "";
      }

      const root = document.getElementById("cafe-menu-catalog");
      if (root) {
        if (!menus.length) {
          root.innerHTML = renderEmptyState("Menu pada kategori ini belum tersedia", "Pilih kategori lain atau refresh data cafe untuk memuat menu terbaru.", "Menu Kosong");
        } else {
          root.innerHTML = menus.map((item) => {
            const qtyId = 'cafe-qty-' + escapeHtml(item.id);
            return renderProductCard({
              image: resolveProductImage(item),
              name: item.name,
              subtitle: item.description || item.summary || '',
              price: item.price || 0,
              availabilityValue: item.stock,
              availabilityLabel: item.stock > 0 ? ('Stock ' + item.stock) : 'Habis',
              categoryLabel: resolveCategory(item, "Menu"),
              placeholderIcon: 'CAFE',
              qtyInputId: qtyId,
              selected: state.cafe.selectedMenuId === item.id,
              actionAttr: 'data-cafe-menu-add',
              actionValue: item.id,
              actionLabel: '+'
            });
          }).join("");
        }
      }
    }

    function renderCafeTableSelector() {
      const root = document.getElementById("cafe-table-selector");
      if (!root) return;
      const numbers = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
      const byTable = {};
      (state.cafe.orders || []).forEach((order) => {
        const key = String(order.tableNumber || "").padStart(2, "0");
        if (!key) return;
        byTable[key] = order;
      });
      if (!state.cafe.selectedTable) state.cafe.selectedTable = "01";
      root.innerHTML = numbers.map((no) => {
        const order = byTable[no];
        const status = order ? (order.status === "NEW" ? "menunggu" : "terisi") : "kosong";
        const className = status === "menunggu" ? "table-chip waiting" : status === "terisi" ? "table-chip occupied" : "table-chip";
        const selected = state.cafe.selectedTable === no;
        return ''
          + '<button type="button" class="' + className + (selected ? ' selected' : '') + '" data-cafe-table="' + no + '">'
          + '<span class="table-no">MEJA ' + no + '</span>'
          + '<span class="table-status">' + status.toUpperCase() + '</span>'
          + '</button>';
      }).join("");
    }

    function renderCafeMenuList() {
      const root = document.getElementById("cafe-menu-list");
      const menus = state.cafe.menus || [];
      if (!menus.length) {
        root.innerHTML = '<div class="notice warn">Belum ada menu item.</div>';
        return;
      }

      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Code</th><th align="left">Name</th><th align="left">Price</th><th align="left">Stock</th><th align="left">Active</th><th align="left">Aksi</th></tr></thead>'
        + '<tbody>' + menus.map((item) => (
          '<tr>'
          + '<td>' + escapeHtml(item.code) + '</td>'
          + '<td>' + escapeHtml(item.name) + '</td>'
          + '<td>' + escapeHtml(formatCurrency(item.price || 0)) + '</td>'
          + '<td>' + escapeHtml(item.stock) + '</td>'
          + '<td>' + escapeHtml(item.active ? "true" : "false") + '</td>'
          + '<td style="display:flex; gap:6px; flex-wrap:wrap;">'
          + '<button class="btn btn-soft" type="button" data-cafe-edit="' + escapeHtml(item.id) + '">Edit</button>'
          + '<button class="btn btn-line" type="button" data-cafe-delete="' + escapeHtml(item.id) + '">Delete</button>'
          + '</td>'
          + '</tr>'
        )).join('') + '</tbody></table></div>';

      root.querySelectorAll("[data-cafe-edit]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-cafe-edit") || "";
          const menu = menus.find((row) => row.id === id);
          if (!menu) return;
          document.getElementById("cafe-menu-category").value = menu.categoryId;
          document.getElementById("cafe-menu-code").value = menu.code;
          document.getElementById("cafe-menu-name").value = menu.name;
          document.getElementById("cafe-menu-price").value = String(menu.price || 0);
          document.getElementById("cafe-menu-stock").value = String(menu.stock || 0);
          document.getElementById("cafe-menu-active").value = String(Boolean(menu.active));
          document.getElementById("cafe-create-menu-btn").setAttribute("data-edit-id", id);
          document.getElementById("cafe-create-menu-btn").textContent = "Update Menu";
        });
      });

      root.querySelectorAll("[data-cafe-delete]").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.getAttribute("data-cafe-delete") || "";
          if (!id) return;
          try {
            await cafeClient.deleteMenu(id);
            showMessage("cafe-msg", "Menu dihapus", "warn");
            await loadCafePage();
          } catch (error) {
            showMessage("cafe-msg", error.message, "err");
          }
        });
      });
    }

    function renderCafeCart() {
      const root = document.getElementById("cafe-cart");
      const selectedTableText = document.getElementById("cafe-selected-table");
      const countRoot = document.getElementById("cafe-order-count");
      const totalQty = state.cafe.cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      if (countRoot) countRoot.textContent = totalQty + ' item';
      if (selectedTableText) {
        selectedTableText.textContent = "MEJA " + (state.cafe.selectedTable || document.getElementById("cafe-table-number").value || "-");
      }
      if (!state.cafe.cart.length) {
        root.innerHTML = renderEmptyState("Keranjang cafe masih kosong", "Pilih meja lalu tambahkan menu favorit untuk mulai membuat order.", "0 Item");
        return;
      }

      const subtotal = state.cafe.cart.reduce((sum, item) => sum + item.total, 0);
      const discount = Math.max(0, Number(document.getElementById("cafe-discount").value || 0));
      const tax = Math.max(0, Number(document.getElementById("cafe-tax").value || 0));
      const total = Math.max(0, subtotal - discount + tax);

      root.innerHTML = state.cafe.cart.map((item, index) => (
        '<article class="order-item">'
        + '<div class="order-item-top"><strong>' + escapeHtml(item.menuName) + '</strong><button type="button" class="btn btn-line" data-cafe-cart-remove="' + String(index) + '">Hapus</button></div>'
        + '<small>' + escapeHtml(item.qty) + ' x ' + escapeHtml(formatCurrency(item.price)) + '</small>'
        + '<strong>' + escapeHtml(formatCurrency(item.total)) + '</strong>'
        + '</article>'
      )).join('')
        + '<div class="totals">'
        + '<div class="row"><span>Subtotal</span><strong>' + escapeHtml(formatCurrency(subtotal)) + '</strong></div>'
        + '<div class="row"><span>Discount</span><strong>- ' + escapeHtml(formatCurrency(discount)) + '</strong></div>'
        + '<div class="row"><span>Tax</span><strong>' + escapeHtml(formatCurrency(tax)) + '</strong></div>'
        + '<div class="row grand"><span>Total</span><strong>' + escapeHtml(formatCurrency(total)) + '</strong></div>'
        + '</div>';

      root.querySelectorAll("[data-cafe-cart-remove]").forEach((button) => {
        button.addEventListener("click", () => {
          const idx = Number(button.getAttribute("data-cafe-cart-remove") || -1);
          if (idx < 0) return;
          state.cafe.cart.splice(idx, 1);
          renderCafeCart();
        });
      });
    }

    function renderCafeOrderList() {
      const root = document.getElementById("cafe-order-list");
      const rows = state.cafe.orders || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Belum ada cafe order.</div>';
        return;
      }

      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Order</th><th align="left">Customer</th><th align="left">Type</th><th align="left">Payment</th><th align="left">Status</th><th align="left">Total</th><th align="left">Aksi</th></tr></thead>'
        + '<tbody>' + rows.map((item) => (
          '<tr>'
          + '<td>' + escapeHtml(item.orderNumber) + '</td>'
          + '<td>' + escapeHtml(item.customerName) + '</td>'
          + '<td>' + escapeHtml(item.orderType) + '</td>'
          + '<td><span class="status-pill status-' + escapeHtml(item.paymentStatus) + '">' + escapeHtml(item.paymentStatus) + '</span></td>'
          + '<td><span class="status-pill status-' + escapeHtml(item.status) + '">' + escapeHtml(item.status) + '</span></td>'
          + '<td>' + escapeHtml(formatCurrency(item.total || 0)) + '</td>'
          + '<td><button class="btn btn-soft" type="button" data-cafe-order-select="' + escapeHtml(item.id) + '">Pilih</button></td>'
          + '</tr>'
        )).join('') + '</tbody></table></div>';

      root.querySelectorAll("[data-cafe-order-select]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-cafe-order-select") || "";
          const order = rows.find((row) => row.id === id);
          if (!order) return;
          state.cafe.currentOrderId = id;
          state.cafe.currentOrder = order;
          state.cafe.selectedTable = String(order.tableNumber || state.cafe.selectedTable || "01").padStart(2, "0");
          document.getElementById("cafe-table-number").value = state.cafe.selectedTable;
          renderCafeTableSelector();
          showMessage("cafe-msg", "Order dipilih: " + order.orderNumber, "ok");
        });
      });
    }

    function renderKitchenColumns() {
      const rows = state.cafe.orders || [];
      const queue = rows.filter((item) => item.status === "NEW");
      const preparing = rows.filter((item) => item.status === "PAID");
      const ready = rows.filter((item) => item.status === "PRINTED");
      const completed = rows.filter((item) => item.status === "COMPLETED");

      document.getElementById("kitchen-queue").innerHTML = queue.map((item) => '<div class="notification-item"><strong>' + escapeHtml(item.orderNumber) + '</strong><br/><small>' + escapeHtml(item.customerName) + ' - ' + escapeHtml(item.tableNumber) + '</small></div>').join('') || '<small>-</small>';
      document.getElementById("kitchen-preparing").innerHTML = preparing.map((item) => '<div class="notification-item"><strong>' + escapeHtml(item.orderNumber) + '</strong><br/><small>' + escapeHtml(item.customerName) + '</small></div>').join('') || '<small>-</small>';
      document.getElementById("kitchen-ready").innerHTML = ready.map((item) => '<div class="notification-item"><strong>' + escapeHtml(item.orderNumber) + '</strong><br/><small>Ready to serve</small></div>').join('') || '<small>-</small>';
      document.getElementById("kitchen-completed").innerHTML = completed.map((item) => '<div class="notification-item"><strong>' + escapeHtml(item.orderNumber) + '</strong><br/><small>Completed</small></div>').join('') || '<small>-</small>';
    }

    async function loadCafePage() {
      try {
        const [categories, menus, orders] = await Promise.all([
          cafeClient.listCategory(),
          cafeClient.listMenu(),
          cafeClient.listOrder()
        ]);
        state.cafe.categories = categories;
        state.cafe.menus = menus;
        state.cafe.orders = orders;
        renderCafeCategoryOptions();
        renderCafeMenuOptions();
        renderCafeTableSelector();
        renderCafeMenuList();
        renderCafeCart();
        renderCafeOrderList();
        document.getElementById("cafe-receipt").textContent = state.cafe.receipt || "Belum ada receipt";
      } catch (error) {
        showMessage("cafe-msg", error.message, "err");
      }
    }

    async function loadKitchenPage() {
      try {
        state.cafe.orders = await cafeClient.listOrder();
        renderKitchenColumns();
      } catch (error) {
        showMessage("cafe-msg", error.message, "err");
      }
    }

    function renderSupplierList() {
      const root = document.getElementById("supplier-list");
      const rows = state.inventoryOps.suppliers || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Belum ada supplier.</div>';
        return;
      }

      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Code</th><th align="left">Name</th><th align="left">Phone</th><th align="left">Email</th><th align="left">Address</th></tr></thead>'
        + '<tbody>' + rows.map((item) => (
          '<tr><td>' + escapeHtml(item.code) + '</td><td>' + escapeHtml(item.name) + '</td><td>' + escapeHtml(item.phone) + '</td><td>' + escapeHtml(item.email) + '</td><td>' + escapeHtml(item.address) + '</td></tr>'
        )).join("") + '</tbody></table></div>';
    }

    function renderInventoryOptions() {
      const inventories = state.inventoryOps.inventories || [];
      const suppliers = state.inventoryOps.suppliers || [];
      const menus = state.cafe.menus || [];

      const invOptions = inventories.map((item) => '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + ' (' + escapeHtml(item.code) + ')</option>').join("");
      const supOptions = suppliers.map((item) => '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + ' (' + escapeHtml(item.code) + ')</option>').join("");
      const menuOptions = menus.map((item) => '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + ' (' + escapeHtml(item.code) + ')</option>').join("");

      document.getElementById("po-inventory").innerHTML = invOptions;
      document.getElementById("adj-inventory").innerHTML = invOptions;
      document.getElementById("recipe-inventory").innerHTML = invOptions;
      document.getElementById("mv-filter-inventory").innerHTML = '<option value="">Semua</option>' + invOptions;
      document.getElementById("po-supplier").innerHTML = supOptions;
      document.getElementById("recipe-menu").innerHTML = menuOptions;
    }

    function renderInventoryList() {
      const root = document.getElementById("inv-list");
      const rows = state.inventoryOps.inventories || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Belum ada inventory.</div>';
        return;
      }

      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Code</th><th align="left">Name</th><th align="left">Unit</th><th align="left">Stock</th><th align="left">Min</th><th align="left">Avg Cost</th></tr></thead>'
        + '<tbody>' + rows.map((item) => (
          '<tr><td>' + escapeHtml(item.code) + '</td><td>' + escapeHtml(item.name) + '</td><td>' + escapeHtml(item.unit) + '</td><td>' + escapeHtml(item.currentStock) + '</td><td>' + escapeHtml(item.minimumStock) + '</td><td>' + escapeHtml(formatCurrency(item.averageCost)) + '</td></tr>'
        )).join("") + '</tbody></table></div>';
    }

    function renderPurchaseItems() {
      const root = document.getElementById("po-items");
      const rows = state.inventoryOps.poItems || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">PO items masih kosong.</div>';
        return;
      }
      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Inventory</th><th align="left">Qty</th><th align="left">Cost</th><th align="left">Total</th></tr></thead>'
        + '<tbody>' + rows.map((item) => (
          '<tr><td>' + escapeHtml(item.inventoryName) + '</td><td>' + escapeHtml(item.qty) + '</td><td>' + escapeHtml(formatCurrency(item.unitCost)) + '</td><td>' + escapeHtml(formatCurrency(item.total)) + '</td></tr>'
        )).join("") + '</tbody></table></div>';
    }

    function renderPurchaseOrders() {
      const root = document.getElementById("po-list");
      const rows = state.inventoryOps.purchaseOrders || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Belum ada purchase order.</div>';
        return;
      }

      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">PO</th><th align="left">Supplier</th><th align="left">Status</th><th align="left">Total</th><th align="left">Aksi</th></tr></thead>'
        + '<tbody>' + rows.map((item) => (
          (() => {
            const canApprove = item.status === "DRAFT";
            const canReceive = item.status === "APPROVED";
            const canCancel = item.status === "DRAFT" || item.status === "APPROVED";
            return '<tr><td>' + escapeHtml(item.poNumber) + '</td><td>' + escapeHtml(item.supplierName) + '</td><td>' + escapeHtml(item.status) + '</td><td>' + escapeHtml(formatCurrency(item.total || 0)) + '</td><td>'
            + '<button class="btn btn-brand" type="button" data-po-detail="' + escapeHtml(item.id) + '">Detail</button> '
            + '<button class="btn btn-soft" type="button" data-po-approve="' + escapeHtml(item.id) + '" ' + (canApprove ? '' : 'disabled') + '>Approve</button> '
            + '<button class="btn btn-line" type="button" data-po-receive="' + escapeHtml(item.id) + '" ' + (canReceive ? '' : 'disabled') + '>Receive</button> '
            + '<button class="btn btn-soft" type="button" data-po-cancel="' + escapeHtml(item.id) + '" ' + (canCancel ? '' : 'disabled') + '>Cancel</button>'
            + '</td></tr>';
          })()
        )).join("") + '</tbody></table></div>';

      root.querySelectorAll("[data-po-detail]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-po-detail") || "";
          if (!id) return;
          navigate("/purchase/" + id);
        });
      });

      root.querySelectorAll("[data-po-approve]").forEach((button) => {
        button.addEventListener("click", async () => {
          try {
            await inventoryPurchasingClient.approvePurchaseOrder(button.getAttribute("data-po-approve"));
            showMessage("po-msg", "PO approved", "ok");
            await loadPurchasePage();
          } catch (error) {
            showMessage("po-msg", error.message, "err");
          }
        });
      });

      root.querySelectorAll("[data-po-receive]").forEach((button) => {
        button.addEventListener("click", async () => {
          try {
            await inventoryPurchasingClient.receivePurchaseOrder(button.getAttribute("data-po-receive"));
            showMessage("po-msg", "PO received", "ok");
            await loadPurchasePage();
          } catch (error) {
            showMessage("po-msg", error.message, "err");
          }
        });
      });

      root.querySelectorAll("[data-po-cancel]").forEach((button) => {
        button.addEventListener("click", async () => {
          try {
            await inventoryPurchasingClient.cancelPurchaseOrder(button.getAttribute("data-po-cancel"), { reason: "Cancelled from purchase list" });
            showMessage("po-msg", "PO cancelled", "ok");
            await loadPurchasePage();
          } catch (error) {
            showMessage("po-msg", error.message, "err");
          }
        });
      });
    }

    function renderRecipeItems() {
      const root = document.getElementById("recipe-items");
      const rows = state.inventoryOps.recipeItems || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Recipe items masih kosong.</div>';
        return;
      }
      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Inventory</th><th align="left">Qty</th></tr></thead>'
        + '<tbody>' + rows.map((item) => '<tr><td>' + escapeHtml(item.inventoryName) + '</td><td>' + escapeHtml(item.qty) + '</td></tr>').join("") + '</tbody></table></div>';
    }

    function renderRecipeList() {
      const root = document.getElementById("recipe-list");
      const rows = state.inventoryOps.recipes || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Belum ada recipe.</div>';
        return;
      }
      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Menu ID</th><th align="left">Ingredients</th></tr></thead>'
        + '<tbody>' + rows.map((item) => '<tr><td>' + escapeHtml(item.menuId) + '</td><td>' + escapeHtml((item.ingredients || []).map((x) => x.inventoryId + " x" + x.qty).join(", ")) + '</td></tr>').join("") + '</tbody></table></div>';
    }

    function renderMovementList(rootId) {
      const root = document.getElementById(rootId);
      const rows = state.inventoryOps.movements || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Belum ada stock movement.</div>';
        return;
      }
      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Type</th><th align="left">Inventory</th><th align="left">Qty</th><th align="left">Balance</th><th align="left">Reference</th><th align="left">Created At</th></tr></thead>'
        + '<tbody>' + rows.map((item) => '<tr><td>' + escapeHtml(item.movementType) + '</td><td>' + escapeHtml(item.inventoryId) + '</td><td>' + escapeHtml(item.qty) + '</td><td>' + escapeHtml(item.balance) + '</td><td>' + escapeHtml(item.reference) + '</td><td>' + escapeHtml(new Date(item.createdAt).toLocaleString("id-ID")) + '</td></tr>').join("") + '</tbody></table></div>';
    }

    function collectMovementFilters() {
      return {
        inventoryId: document.getElementById("mv-filter-inventory").value,
        movementType: document.getElementById("mv-filter-type").value,
        reference: document.getElementById("mv-filter-reference").value.trim(),
        from: document.getElementById("mv-filter-from").value,
        to: document.getElementById("mv-filter-to").value
      };
    }

    function syncMovementFilterInputs() {
      const filters = state.inventoryOps.movementFilters;
      document.getElementById("mv-filter-inventory").value = filters.inventoryId || "";
      document.getElementById("mv-filter-type").value = filters.movementType || "";
      document.getElementById("mv-filter-reference").value = filters.reference || "";
      document.getElementById("mv-filter-from").value = filters.from || "";
      document.getElementById("mv-filter-to").value = filters.to || "";
    }

    function renderPurchaseDetail() {
      const detail = state.inventoryOps.purchaseDetail;
      const metaRoot = document.getElementById("po-detail-meta");
      const itemsRoot = document.getElementById("po-detail-items");
      if (!detail) {
        metaRoot.innerHTML = '<div class="notice warn">Detail PO belum tersedia.</div>';
        itemsRoot.innerHTML = "";
        return;
      }

      metaRoot.innerHTML =
        '<div><strong>PO Number:</strong> ' + escapeHtml(detail.poNumber) + '</div>' +
        '<div><strong>Supplier:</strong> ' + escapeHtml(detail.supplierName) + '</div>' +
        '<div><strong>Status:</strong> ' + escapeHtml(detail.status) + '</div>' +
        '<div><strong>Subtotal:</strong> ' + escapeHtml(formatCurrency(detail.subtotal || 0)) + '</div>' +
        '<div><strong>Total:</strong> ' + escapeHtml(formatCurrency(detail.total || 0)) + '</div>' +
        '<div><strong>Updated At:</strong> ' + escapeHtml(new Date(detail.updatedAt).toLocaleString("id-ID")) + '</div>';

      const rows = detail.items || [];
      if (!rows.length) {
        itemsRoot.innerHTML = '<div class="notice warn">PO tidak memiliki item.</div>';
      } else {
        itemsRoot.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
          + '<thead><tr><th align="left">Inventory</th><th align="left">Qty</th><th align="left">Unit Cost</th><th align="left">Total</th></tr></thead>'
          + '<tbody>' + rows.map((item) => (
            '<tr><td>' + escapeHtml(item.inventoryName) + '</td><td>' + escapeHtml(item.qty) + '</td><td>' + escapeHtml(formatCurrency(item.unitCost || 0)) + '</td><td>' + escapeHtml(formatCurrency(item.total || 0)) + '</td></tr>'
          )).join("") + '</tbody></table></div>';
      }

      document.getElementById("po-detail-approve-btn").disabled = detail.status !== "DRAFT";
      document.getElementById("po-detail-receive-btn").disabled = detail.status !== "APPROVED";
      document.getElementById("po-detail-cancel-btn").disabled = !(detail.status === "DRAFT" || detail.status === "APPROVED");
    }

    async function loadSupplierPage() {
      try {
        state.inventoryOps.suppliers = await inventoryPurchasingClient.listSupplier();
        renderSupplierList();
        renderInventoryOptions();
      } catch (error) {
        showMessage("supplier-msg", error.message, "err");
      }
    }

    async function loadInventoryPage() {
      try {
        const [inventories, dashboard] = await Promise.all([
          inventoryPurchasingClient.listInventory(),
          inventoryPurchasingClient.inventoryDashboard()
        ]);
        state.inventoryOps.inventories = inventories;
        document.getElementById("inv-kpi-low-stock").textContent = String((dashboard.lowStock || []).length || 0);
        document.getElementById("inv-kpi-value").textContent = formatCurrency(dashboard.inventoryValue || 0);
        document.getElementById("inv-kpi-purchase-today").textContent = formatCurrency(dashboard.purchaseToday || 0);
        document.getElementById("inv-kpi-consumption-today").textContent = String(dashboard.consumptionToday || 0);
        document.getElementById("inv-kpi-waste-today").textContent = String(dashboard.wasteToday || 0);
        renderInventoryList();
        renderInventoryOptions();
      } catch (error) {
        showMessage("inv-msg", error.message, "err");
      }
    }

    async function loadPurchasePage() {
      try {
        const [suppliers, inventories, purchaseOrders] = await Promise.all([
          inventoryPurchasingClient.listSupplier(),
          inventoryPurchasingClient.listInventory(),
          inventoryPurchasingClient.listPurchaseOrder()
        ]);
        state.inventoryOps.suppliers = suppliers;
        state.inventoryOps.inventories = inventories;
        state.inventoryOps.purchaseOrders = purchaseOrders;
        renderInventoryOptions();
        renderPurchaseItems();
        renderPurchaseOrders();
      } catch (error) {
        showMessage("po-msg", error.message, "err");
      }
    }

    async function loadPurchaseDetail(id) {
      try {
        state.inventoryOps.purchaseDetail = await inventoryPurchasingClient.getPurchaseOrderById(id);
        renderPurchaseDetail();
      } catch (error) {
        showMessage("po-detail-msg", error.message, "err");
      }
    }

    async function loadRecipePage() {
      try {
        const [recipes, inventories, menus] = await Promise.all([
          inventoryPurchasingClient.listRecipe(),
          inventoryPurchasingClient.listInventory(),
          cafeClient.listMenu()
        ]);
        state.inventoryOps.recipes = recipes;
        state.inventoryOps.inventories = inventories;
        state.cafe.menus = menus;
        renderInventoryOptions();
        renderRecipeItems();
        renderRecipeList();
      } catch (error) {
        showMessage("recipe-msg", error.message, "err");
      }
    }

    async function loadStockAdjustmentPage() {
      try {
        const [inventories, movements] = await Promise.all([
          inventoryPurchasingClient.listInventory(),
          inventoryPurchasingClient.listStockMovement()
        ]);
        state.inventoryOps.inventories = inventories;
        state.inventoryOps.movements = movements;
        renderInventoryOptions();
        renderMovementList("movement-list");
      } catch (error) {
        showMessage("adj-msg", error.message, "err");
      }
    }

    async function loadStockMovementPage() {
      try {
        const [inventories, movements] = await Promise.all([
          inventoryPurchasingClient.listInventory(),
          inventoryPurchasingClient.listStockMovement(state.inventoryOps.movementFilters)
        ]);
        state.inventoryOps.inventories = inventories;
        state.inventoryOps.movements = movements;
        renderInventoryOptions();
        syncMovementFilterInputs();
        renderMovementList("mv-list");
      } catch (error) {
        showMessage("mv-msg", error.message, "err");
      }
    }

    function resetGatePanel() {
      document.getElementById("gate-qr-token").value = "";
      document.getElementById("gate-result").innerHTML = "";
      document.getElementById("gate-msg").innerHTML = "";
    }

    async function loadTicketPreview(id) {
      try {
        const ticket = await posTicketingService.getTicket(id);
        state.pos.currentSaleId = id;
        state.pos.currentPreview = ticket;
        document.getElementById("ticket-preview-meta").innerHTML =
          '<div><strong>Ticket Number:</strong> ' + escapeHtml(ticket.ticketNumber) + '</div>' +
          '<div><strong>Nama:</strong> ' + escapeHtml(ticket.customerName) + '</div>' +
          '<div><strong>Jenis Tiket:</strong> ' + escapeHtml(ticket.ticketType) + '</div>' +
          '<div><strong>Qty:</strong> ' + escapeHtml(ticket.qty) + '</div>' +
          '<div><strong>Harga:</strong> ' + escapeHtml(formatCurrency(ticket.price)) + '</div>' +
          '<div><strong>Status:</strong> <span class="status-pill status-' + escapeHtml(ticket.status) + '">' + escapeHtml(ticket.status) + '</span></div>';
        document.getElementById("ticket-preview-qr").innerHTML = safeQrSvg(ticket.qrSvg) || "QR belum tersedia";
        document.getElementById("ticket-layout-80").textContent = ticket.layout80mm || "";
        document.getElementById("ticket-layout-58").textContent = ticket.layout58mm || "";
      } catch (error) {
        showMessage("ticket-preview-msg", error.message, "err");
      }
    }

    function renderCashierSummary(summary, current) {
      document.getElementById("cashier-status").value = summary.shiftStatus || "CLOSED";
      document.getElementById("cashier-cash-sales").value = String(summary.cashSales || 0);
      document.getElementById("cashier-qris-sales").value = String(summary.qrisSales || 0);
      document.getElementById("cashier-transfer-sales").value = String(summary.transferSales || 0);
      document.getElementById("cashier-ticket-count").value = String(summary.ticketCount || 0);
      document.getElementById("cashier-expected-cash").value = String(summary.expectedCash || 0);
      document.getElementById("cashier-current-cash").value = String(summary.currentCash || 0);
      document.getElementById("cashier-difference").value = String(summary.difference || 0);
      document.getElementById("cashier-opening-cash").value = String((current && current.openingCash) || summary.openingCash || 0);
      if (current) {
        document.getElementById("cashier-id").value = current.cashierId || "";
        document.getElementById("cashier-name").value = current.cashierName || "";
      }
    }

    function renderCashierHistory() {
      const root = document.getElementById("cashier-history");
      const rows = state.cashier.history || [];
      if (!rows.length) {
        root.innerHTML = '<div class="notice warn">Belum ada riwayat shift.</div>';
        return;
      }

      root.innerHTML = '<div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<thead><tr><th align="left">Shift</th><th align="left">Kasir</th><th align="left">Status</th><th align="left">Open</th><th align="left">Close</th><th align="left">Cash</th><th align="left">QRIS</th><th align="left">Transfer</th><th align="left">Ticket</th><th align="left">Selisih</th></tr></thead>'
        + '<tbody>' + rows.map((item) => (
          '<tr>'
          + '<td>' + escapeHtml(item.shiftNumber) + '</td>'
          + '<td>' + escapeHtml(item.cashierName) + '</td>'
          + '<td>' + escapeHtml(item.status) + '</td>'
          + '<td>' + escapeHtml(item.openedAt) + '</td>'
          + '<td>' + escapeHtml(item.closedAt || '-') + '</td>'
          + '<td>' + escapeHtml(formatCurrency(item.cashSales || 0)) + '</td>'
          + '<td>' + escapeHtml(formatCurrency(item.qrisSales || 0)) + '</td>'
          + '<td>' + escapeHtml(formatCurrency(item.transferSales || 0)) + '</td>'
          + '<td>' + escapeHtml(item.ticketCount || 0) + '</td>'
          + '<td>' + escapeHtml(formatCurrency(item.difference || 0)) + '</td>'
          + '</tr>'
        )).join('') + '</tbody></table></div>';
    }

    async function loadCashierPage() {
      try {
        const current = await cashierShiftClient.current();
        const summary = await cashierShiftClient.summary();
        const history = await cashierShiftClient.history();
        state.cashier.current = current;
        state.cashier.summary = summary;
        state.cashier.history = history;
        renderCashierSummary(summary, current);
        renderCashierHistory();
      } catch (error) {
        showMessage("cashier-msg", error.message, "err");
      }
    }

    function addPosItem(ticketIdArg, qtyArg) {
      const ticketId = ticketIdArg || document.getElementById("pos-ticket-select").value;
      const qty = Math.max(1, Number(qtyArg || document.getElementById("pos-ticket-qty").value || 1));
      const ticket = state.pos.tickets.find((item) => item.id === ticketId);
      if (!ticket) {
        showMessage("pos-msg", "Tiket tidak ditemukan", "err");
        return;
      }
      if (qty > ticket.quota) {
        showMessage("pos-msg", "Qty melebihi quota tiket", "warn");
        return;
      }

      state.pos.items.push({
        ticketId: ticket.id,
        ticketName: ticket.name,
        qty,
        price: ticket.price,
        total: ticket.price * qty
      });
      state.pos.selectedTicketId = ticket.id;
      renderPosTicketCatalog();
      renderPosItems();
      showMessage("pos-msg", "Item tiket ditambahkan", "ok");
    }

    function addReservationItem() {
      const ticketId = document.getElementById("reservation-ticket-select").value;
      const qty = Math.max(1, Number(document.getElementById("reservation-ticket-qty").value || 1));
      const ticket = state.pos.tickets.find((item) => item.id === ticketId);
      if (!ticket) {
        showMessage("reservation-msg", "Tiket tidak ditemukan", "err");
        return;
      }
      if (qty > ticket.quota) {
        showMessage("reservation-msg", "Qty melebihi quota tiket", "warn");
        return;
      }

      state.reservation.items.push({
        ticketId: ticket.id,
        ticketName: ticket.name,
        qty,
        price: ticket.price,
        total: ticket.price * qty
      });
      renderReservationItems();
      showMessage("reservation-msg", "Ticket item ditambahkan", "ok");
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
      state.wizard.customerName = "";
      state.wizard.customerPhone = "";
      state.wizard.customerEmail = "";
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
      const protectedPaths = ["/customer/dashboard", "/customer/profile", "/customer/history", "/customer/payment"];
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
      wrap.innerHTML = wizardStepLabels.map((label, idx) => {
        const stepNumber = idx + 1;
        const tone = state.wizard.step === stepNumber ? 'active' : state.wizard.step > stepNumber ? 'complete' : 'upcoming';
        const parts = String(label).split(' ');
        const indexLabel = parts.shift() || String(stepNumber).padStart(2, '0');
        const textLabel = parts.join(' ');
        return ''
          + '<div class="wizard-step ' + tone + '">'
          + '<span class="wizard-step-index">' + escapeHtml(indexLabel) + '</span>'
          + '<span class="wizard-step-label">' + escapeHtml(textLabel) + '</span>'
          + '</div>';
      }).join("");
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
      document.getElementById("wiz-next").disabled = state.wizard.step >= 5;
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

    function renderWizardReviewContact() {
      const root = document.getElementById("wiz-review-contact");
      if (!root) return;
      const name = state.wizard.customerName || "-";
      const phone = state.wizard.customerPhone || "-";
      const email = state.wizard.customerEmail || "-";
      root.innerHTML = ''
        + '<h3 style="margin:0 0 8px;">Data Pemesan (Opsional)</h3>'
        + '<div class="grid grid-3">'
        + '<div><label>Nama</label><input value="' + escapeHtml(name) + '" readonly /></div>'
        + '<div><label>No HP</label><input value="' + escapeHtml(phone) + '" readonly /></div>'
        + '<div><label>Email</label><input value="' + escapeHtml(email) + '" readonly /></div>'
        + '</div>';
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
        renderWizardReviewContact();
        return;
      }
      root.innerHTML = '<div class="row"><span>Subtotal</span><strong>' + formatCurrency(q.price.subtotal) + '</strong></div>' +
        '<div class="row"><span>Diskon</span><strong>- ' + formatCurrency(q.price.discount) + '</strong></div>' +
        '<div class="row"><span>Pajak</span><strong>' + formatCurrency(q.price.tax) + '</strong></div>' +
        '<div class="row"><span>Service</span><strong>' + formatCurrency(q.price.service) + '</strong></div>' +
        '<div class="row grand"><span>Grand Total</span><strong>' + formatCurrency(q.price.grandTotal) + "</strong></div>";
      renderWizardReviewContact();
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
      document.getElementById("wiz-customer-name").value = state.wizard.customerName;
      document.getElementById("wiz-customer-phone").value = state.wizard.customerPhone;
      document.getElementById("wiz-customer-email").value = state.wizard.customerEmail;
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
        const reservation = await reservationClient.report();
        const activityReport = await activityClient.bookingReport();
        document.getElementById("dash-my-reservations").textContent = String((reservation.reservationToday || 0) + (reservation.paidReservation || 0));
        document.getElementById("dash-waiting-payment").textContent = String(reservation.waitingPayment || 0);
        document.getElementById("dash-today-visitor").textContent = String(reservation.todayVisitor || 0);
        document.getElementById("dash-upcoming-visitor").textContent = String(reservation.upcomingVisitor || 0);
        document.getElementById("dash-activity-today").textContent = String(activityReport.todayActivities || 0);
        document.getElementById("dash-activity-upcoming").textContent = String((activityReport.upcomingSessions || []).length);
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
      var btn = document.getElementById("header-auth-btn");
      var token = localStorage.getItem("satset.customer.token");
      document.querySelectorAll('.nav-auth').forEach(function(el) { el.style.display = token ? '' : 'none'; });
      document.querySelectorAll('.nav-guest').forEach(function(el) { el.style.display = token ? 'none' : ''; });
      if (token) {
        btn.textContent = "Keluar";
        btn.onclick = function() { logoutCustomer(); };
      } else {
        btn.textContent = "Masuk";
        btn.onclick = function() { navigate("/customer/login"); };
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
      const target = event.target.closest("[data-link],[data-nav],[data-service],[data-slot],[data-pos-ticket-add],[data-pos-category],[data-cafe-category],[data-cafe-menu-add],[data-cafe-table],[data-ab-activity],[data-ab-schedule],[data-ab-quick-date]");
      if (!target) return;

      if (target.hasAttribute("data-pos-category")) {
        state.pos.activeCategory = target.getAttribute("data-pos-category") || "Semua";
        renderPosCategoryTabs();
        renderPosTicketCatalog();
        return;
      }

      if (target.hasAttribute("data-pos-ticket-add")) {
        const ticketId = target.getAttribute("data-pos-ticket-add") || "";
        const qtyInput = document.getElementById("pos-qty-" + ticketId);
        const qty = Math.max(1, Number((qtyInput && qtyInput.value) || 1));
        addPosItem(ticketId, qty);
        return;
      }

      if (target.hasAttribute("data-ab-quick-date")) {
        const now = new Date();
        const type = target.getAttribute("data-ab-quick-date") || "today";
        if (type === "tomorrow") now.setDate(now.getDate() + 1);
        if (type === "next") now.setDate(now.getDate() + 2);
        const date = now.toISOString().slice(0, 10);
        document.getElementById("ab-date").value = date;
        return;
      }

      if (target.hasAttribute("data-service")) {
        state.wizard.service = target.getAttribute("data-service");
        state.wizard.time = "";
        state.wizard.latestQuote = null;
        syncWizardUI();
        return;
      }

      if (target.hasAttribute("data-cafe-category")) {
        state.cafe.activeCategory = target.getAttribute("data-cafe-category") || "Semua";
        renderCafeCategoryOptions();
        renderCafeMenuOptions();
        return;
      }

      if (target.hasAttribute("data-cafe-menu-add")) {
        const menuId = target.getAttribute("data-cafe-menu-add") || "";
        const qtyInput = document.getElementById("cafe-qty-" + menuId);
        const qty = Math.max(1, Number((qtyInput && qtyInput.value) || 1));
        const menu = (state.cafe.menus || []).find((item) => item.id === menuId);
        if (!menu) return;
        if (qty > Number(menu.stock || 0)) {
          showMessage("cafe-msg", "Qty melebihi stock menu", "warn");
          return;
        }
        state.cafe.cart.push({
          menuItemId: menu.id,
          menuName: menu.name,
          qty,
          price: menu.price,
          total: menu.price * qty
        });
        state.cafe.selectedMenuId = menu.id;
        renderCafeMenuOptions();
        renderCafeCart();
        showMessage("cafe-msg", "Menu ditambahkan ke cart", "ok");
        return;
      }

      if (target.hasAttribute("data-cafe-table")) {
        state.cafe.selectedTable = target.getAttribute("data-cafe-table") || "01";
        document.getElementById("cafe-table-number").value = state.cafe.selectedTable;
        document.getElementById("cafe-order-type").value = "DINE_IN";
        renderCafeTableSelector();
        renderCafeCart();
        return;
      }

      if (target.hasAttribute("data-ab-activity")) {
        const id = target.getAttribute("data-ab-activity") || "";
        document.getElementById("ab-activity-select").value = id;
        state.activity.currentActivityId = id;
        renderActivityScheduleOptions();
        renderActivitySelectOptions();
        return;
      }

      if (target.hasAttribute("data-ab-schedule")) {
        const id = target.getAttribute("data-ab-schedule") || "";
        document.getElementById("ab-schedule-select").value = id;
        const schedule = (state.activity.schedules || []).find((item) => item.id === id);
        if (schedule) {
          document.getElementById("ab-date").value = schedule.date || "";
          document.getElementById("ab-session").value = schedule.session || "";
          document.getElementById("ab-capacity").value = String(schedule.capacity || 20);
        }
        renderActivityScheduleOptions();
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
    document.getElementById("wiz-customer-name").addEventListener("input", (event) => {
      state.wizard.customerName = String(event.target.value || "").trim();
      renderWizardReviewContact();
    });
    document.getElementById("wiz-customer-phone").addEventListener("input", (event) => {
      state.wizard.customerPhone = String(event.target.value || "").trim();
      renderWizardReviewContact();
    });
    document.getElementById("wiz-customer-email").addEventListener("input", (event) => {
      state.wizard.customerEmail = String(event.target.value || "").trim();
      renderWizardReviewContact();
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
      if (state.wizard.step < 5) {
        state.wizard.step += 1;
        syncWizardUI();
      }
    });

    document.getElementById("wiz-booking-submit").addEventListener("click", async () => {
      try {
        if (!state.wizard.customerPhone && !state.wizard.customerEmail) {
          showMessage("wiz-payment-status", "Isi minimal nomor HP atau email untuk kontak booking.", "warn");
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

    document.getElementById("wiz-member-check").addEventListener("click", () => {
      const value = String(document.getElementById("wiz-member-contact").value || "").trim();
      const result = document.getElementById("wiz-member-result");
      if (!value) {
        result.className = "notice warn";
        result.textContent = "Masukkan nomor HP atau email untuk cek status member (placeholder UI).";
        return;
      }
      result.className = "notice info";
      result.textContent = "Pencarian member untuk '" + value + "' akan aktif setelah backend member tersedia.";
    });

    document.getElementById("wiz-member-signup").addEventListener("click", () => {
      const result = document.getElementById("wiz-member-result");
      result.className = "notice info";
      result.textContent = "Form pendaftaran member akan dihubungkan ke backend pada fase berikutnya. Lanjutkan booking sebagai guest untuk saat ini.";
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

    document.getElementById("pos-add-item").addEventListener("click", () => {
      addPosItem();
    });

    document.getElementById("reservation-add-item").addEventListener("click", () => {
      addReservationItem();
    });

    document.getElementById("reservation-refresh-btn").addEventListener("click", async () => {
      await loadReservationPage();
      showMessage("reservation-msg", "Reservation list direfresh", "ok");
    });

    document.getElementById("reservation-create-btn").addEventListener("click", async () => {
      try {
        if (!state.reservation.items.length) {
          showMessage("reservation-msg", "Tambahkan minimal satu ticket item", "warn");
          return;
        }

        const payload = {
          customerName: document.getElementById("reservation-customer-name").value || "Walk In",
          customerPhone: document.getElementById("reservation-customer-phone").value || "-",
          customerEmail: document.getElementById("reservation-customer-email").value || "walkin@satset.local",
          visitDate: document.getElementById("reservation-visit-date").value,
          visitSession: document.getElementById("reservation-visit-session").value,
          paymentMethod: document.getElementById("reservation-payment-method").value,
          ticketItems: state.reservation.items.map((item) => ({
            ticketId: item.ticketId,
            ticketName: item.ticketName,
            qty: item.qty,
            price: item.price,
            total: item.total
          }))
        };

        if (!payload.visitDate) {
          showMessage("reservation-msg", "Visit date wajib diisi", "warn");
          return;
        }

        const created = await reservationClient.create(payload);
        state.reservation.items = [];
        renderReservationItems();
        showMessage("reservation-msg", "Booking dibuat: " + created.bookingNumber, "ok");
        await loadReservationPage();
        navigate("/reservation/" + created.id);
      } catch (error) {
        showMessage("reservation-msg", error.message, "err");
      }
    });

    document.getElementById("activity-refresh-btn").addEventListener("click", async () => {
      await loadActivitiesPage();
      showMessage("activity-msg", "Daftar activity direfresh", "ok");
    });

    document.getElementById("activity-create-btn").addEventListener("click", async () => {
      try {
        const payload = {
          code: document.getElementById("activity-code").value,
          name: document.getElementById("activity-name").value,
          category: document.getElementById("activity-category").value,
          duration: Number(document.getElementById("activity-duration").value || 60),
          capacity: Number(document.getElementById("activity-capacity").value || 20),
          price: Number(document.getElementById("activity-price").value || 0),
          active: document.getElementById("activity-active").value === "true"
        };

        const editId = document.getElementById("activity-create-btn").getAttribute("data-edit-id") || "";
        if (editId) {
          await activityClient.updateActivity(editId, payload);
          document.getElementById("activity-create-btn").removeAttribute("data-edit-id");
          document.getElementById("activity-create-btn").textContent = "Create Activity";
          showMessage("activity-msg", "Activity diperbarui", "ok");
        } else {
          const created = await activityClient.createActivity(payload);
          showMessage("activity-msg", "Activity dibuat: " + created.code, "ok");
        }

        await loadActivitiesPage();
      } catch (error) {
        showMessage("activity-msg", error.message, "err");
      }
    });

    document.getElementById("ab-activity-select").addEventListener("change", () => {
      state.activity.currentActivityId = document.getElementById("ab-activity-select").value || "";
      renderActivitySelectOptions();
      renderActivityScheduleOptions();
    });

    document.getElementById("ab-refresh-btn").addEventListener("click", async () => {
      await loadActivityBookingPage();
      showMessage("ab-msg", "Data activity booking direfresh", "ok");
    });

    document.getElementById("ab-date").addEventListener("change", () => {
      renderActivityScheduleOptions();
    });

    document.getElementById("ab-create-schedule-btn").addEventListener("click", async () => {
      try {
        const payload = {
          activityId: document.getElementById("ab-activity-select").value,
          date: document.getElementById("ab-date").value,
          session: (document.getElementById("ab-session").value || "MORNING").toUpperCase(),
          capacity: Number(document.getElementById("ab-capacity").value || 20)
        };
        const created = await activityClient.createSchedule(payload);
        showMessage("ab-msg", "Schedule dibuat: " + created.date + " " + created.session, "ok");
        await loadActivityBookingPage();
      } catch (error) {
        showMessage("ab-msg", error.message, "err");
      }
    });

    document.getElementById("ab-create-booking-btn").addEventListener("click", async () => {
      try {
        const payload = {
          reservationId: document.getElementById("ab-reservation-id").value,
          customerName: document.getElementById("ab-customer-name").value,
          activityId: document.getElementById("ab-activity-select").value,
          scheduleId: document.getElementById("ab-schedule-select").value,
          qty: Number(document.getElementById("ab-qty").value || 1)
        };
        const created = await activityClient.createBooking(payload);
        state.activity.currentBookingId = created.id;
        state.activity.currentBooking = created;
        document.getElementById("ab-status").value = created.status || "WAITING_PAYMENT";
        showMessage("ab-msg", "Activity booking dibuat: " + created.bookingNumber, "ok");
        await loadActivityBookingPage();
      } catch (error) {
        showMessage("ab-msg", error.message, "err");
      }
    });

    document.getElementById("ab-pay-btn").addEventListener("click", async () => {
      try {
        const id = state.activity.currentBookingId;
        if (!id) throw new Error("Pilih booking dulu");
        const paymentMethod = document.getElementById("ab-payment-method").value;
        const paid = await activityClient.payBooking(id, paymentMethod);
        state.activity.currentBooking = paid;
        document.getElementById("ab-status").value = paid.status || "CONFIRMED";
        const qr = await activityClient.bookingQr(id);
        document.getElementById("ab-qr").innerHTML = safeQrSvg(qr.svg) || "QR belum tersedia";
        renderActivityBookingTimeline(paid);
        showMessage("ab-msg", "Payment sukses: " + paid.bookingNumber, "ok");
        await loadActivityBookingPage();
      } catch (error) {
        showMessage("ab-msg", error.message, "err");
      }
    });

    document.getElementById("ab-checkin-btn").addEventListener("click", async () => {
      try {
        const id = state.activity.currentBookingId;
        if (!id) throw new Error("Pilih booking dulu");
        const checked = await activityClient.checkInBooking(id);
        state.activity.currentBooking = checked;
        document.getElementById("ab-status").value = checked.status || "COMPLETED";
        renderActivityBookingTimeline(checked);
        showMessage("ab-msg", "Check-in sukses: " + checked.bookingNumber, "ok");
        await loadActivityBookingPage();
      } catch (error) {
        showMessage("ab-msg", error.message, "err");
      }
    });

    document.getElementById("ab-cancel-btn").addEventListener("click", async () => {
      try {
        const id = state.activity.currentBookingId;
        if (!id) throw new Error("Pilih booking dulu");
        const cancelled = await activityClient.cancelBooking(id);
        state.activity.currentBooking = cancelled;
        document.getElementById("ab-status").value = cancelled.status || "CANCELLED";
        renderActivityBookingTimeline(cancelled);
        showMessage("ab-msg", "Booking dibatalkan: " + cancelled.bookingNumber, "warn");
        await loadActivityBookingPage();
      } catch (error) {
        showMessage("ab-msg", error.message, "err");
      }
    });

    document.getElementById("cafe-refresh-btn").addEventListener("click", async () => {
      await loadCafePage();
      showMessage("cafe-msg", "Data cafe direfresh", "ok");
    });

    document.getElementById("kitchen-refresh-btn").addEventListener("click", async () => {
      await loadKitchenPage();
      showMessage("cafe-msg", "Kitchen queue direfresh", "ok");
    });

    document.getElementById("supplier-refresh-btn").addEventListener("click", async () => {
      await loadSupplierPage();
      showMessage("supplier-msg", "Supplier direfresh", "ok");
    });

    document.getElementById("supplier-create-btn").addEventListener("click", async () => {
      try {
        const created = await inventoryPurchasingClient.createSupplier({
          code: document.getElementById("supplier-code").value,
          name: document.getElementById("supplier-name").value,
          phone: document.getElementById("supplier-phone").value,
          email: document.getElementById("supplier-email").value,
          address: document.getElementById("supplier-address").value,
          active: true
        });
        showMessage("supplier-msg", "Supplier dibuat: " + created.code, "ok");
        await loadSupplierPage();
      } catch (error) {
        showMessage("supplier-msg", error.message, "err");
      }
    });

    document.getElementById("inv-refresh-btn").addEventListener("click", async () => {
      await loadInventoryPage();
      showMessage("inv-msg", "Inventory direfresh", "ok");
    });

    document.getElementById("inv-create-btn").addEventListener("click", async () => {
      try {
        const created = await inventoryPurchasingClient.createInventory({
          code: document.getElementById("inv-code").value,
          name: document.getElementById("inv-name").value,
          unit: document.getElementById("inv-unit").value,
          category: document.getElementById("inv-category").value,
          minimumStock: Number(document.getElementById("inv-minimum").value || 0),
          currentStock: Number(document.getElementById("inv-current").value || 0),
          averageCost: Number(document.getElementById("inv-cost").value || 0),
          active: true
        });
        showMessage("inv-msg", "Inventory dibuat: " + created.code, "ok");
        await loadInventoryPage();
      } catch (error) {
        showMessage("inv-msg", error.message, "err");
      }
    });

    document.getElementById("po-add-item-btn").addEventListener("click", () => {
      const inventoryId = document.getElementById("po-inventory").value;
      const qty = Number(document.getElementById("po-qty").value || 0);
      const unitCost = Number(document.getElementById("po-unit-cost").value || 0);
      const inventory = (state.inventoryOps.inventories || []).find((item) => item.id === inventoryId);
      if (!inventory || qty <= 0) {
        showMessage("po-msg", "Pilih inventory dan qty valid", "warn");
        return;
      }
      state.inventoryOps.poItems.push({
        inventoryId,
        inventoryName: inventory.name,
        qty,
        unitCost,
        total: qty * unitCost
      });
      renderPurchaseItems();
      showMessage("po-msg", "Item PO ditambahkan", "ok");
    });

    document.getElementById("po-refresh-btn").addEventListener("click", async () => {
      await loadPurchasePage();
      showMessage("po-msg", "PO direfresh", "ok");
    });

    document.getElementById("po-detail-refresh-btn").addEventListener("click", async () => {
      const id = location.pathname.split("/").pop();
      if (!id) return;
      await loadPurchaseDetail(id);
      showMessage("po-detail-msg", "PO detail direfresh", "ok");
    });

    document.getElementById("po-detail-approve-btn").addEventListener("click", async () => {
      const detail = state.inventoryOps.purchaseDetail;
      if (!detail) return;
      try {
        await inventoryPurchasingClient.approvePurchaseOrder(detail.id);
        await loadPurchaseDetail(detail.id);
        showMessage("po-detail-msg", "PO approved", "ok");
      } catch (error) {
        showMessage("po-detail-msg", error.message, "err");
      }
    });

    document.getElementById("po-detail-receive-btn").addEventListener("click", async () => {
      const detail = state.inventoryOps.purchaseDetail;
      if (!detail) return;
      try {
        await inventoryPurchasingClient.receivePurchaseOrder(detail.id);
        await loadPurchaseDetail(detail.id);
        showMessage("po-detail-msg", "PO received", "ok");
      } catch (error) {
        showMessage("po-detail-msg", error.message, "err");
      }
    });

    document.getElementById("po-detail-cancel-btn").addEventListener("click", async () => {
      const detail = state.inventoryOps.purchaseDetail;
      if (!detail) return;
      try {
        await inventoryPurchasingClient.cancelPurchaseOrder(detail.id, { reason: "Cancelled from purchase detail" });
        await loadPurchaseDetail(detail.id);
        showMessage("po-detail-msg", "PO cancelled", "ok");
      } catch (error) {
        showMessage("po-detail-msg", error.message, "err");
      }
    });

    document.getElementById("po-create-btn").addEventListener("click", async () => {
      try {
        if (!(state.inventoryOps.poItems || []).length) {
          showMessage("po-msg", "Tambahkan item PO dahulu", "warn");
          return;
        }
        const supplierId = document.getElementById("po-supplier").value;
        const supplier = (state.inventoryOps.suppliers || []).find((item) => item.id === supplierId);
        if (!supplier) {
          showMessage("po-msg", "Supplier belum dipilih", "warn");
          return;
        }
        const created = await inventoryPurchasingClient.createPurchaseOrder({
          supplierId,
          supplierName: supplier.name,
          items: state.inventoryOps.poItems
        });
        state.inventoryOps.poItems = [];
        renderPurchaseItems();
        showMessage("po-msg", "PO dibuat: " + created.poNumber, "ok");
        await loadPurchasePage();
      } catch (error) {
        showMessage("po-msg", error.message, "err");
      }
    });

    document.getElementById("recipe-add-item-btn").addEventListener("click", () => {
      const inventoryId = document.getElementById("recipe-inventory").value;
      const qty = Number(document.getElementById("recipe-qty").value || 0);
      const inventory = (state.inventoryOps.inventories || []).find((item) => item.id === inventoryId);
      if (!inventory || qty <= 0) {
        showMessage("recipe-msg", "Pilih inventory dan qty valid", "warn");
        return;
      }
      state.inventoryOps.recipeItems.push({ inventoryId, inventoryName: inventory.name, qty });
      renderRecipeItems();
      showMessage("recipe-msg", "Ingredient ditambahkan", "ok");
    });

    document.getElementById("recipe-refresh-btn").addEventListener("click", async () => {
      await loadRecipePage();
      showMessage("recipe-msg", "Recipe direfresh", "ok");
    });

    document.getElementById("recipe-save-btn").addEventListener("click", async () => {
      try {
        const menuId = document.getElementById("recipe-menu").value;
        if (!menuId) {
          showMessage("recipe-msg", "Pilih menu terlebih dahulu", "warn");
          return;
        }
        if (!(state.inventoryOps.recipeItems || []).length) {
          showMessage("recipe-msg", "Tambahkan ingredient recipe", "warn");
          return;
        }
        await inventoryPurchasingClient.upsertRecipe(menuId, {
          menuId,
          ingredients: state.inventoryOps.recipeItems.map((item) => ({ inventoryId: item.inventoryId, qty: item.qty }))
        });
        showMessage("recipe-msg", "Recipe tersimpan", "ok");
        await loadRecipePage();
      } catch (error) {
        showMessage("recipe-msg", error.message, "err");
      }
    });

    document.getElementById("adj-submit-btn").addEventListener("click", async () => {
      try {
        await inventoryPurchasingClient.stockAdjustment({
          inventoryId: document.getElementById("adj-inventory").value,
          qty: Number(document.getElementById("adj-qty").value || 0),
          reason: document.getElementById("adj-reason").value
        });
        showMessage("adj-msg", "Stock adjustment berhasil", "ok");
        await loadStockAdjustmentPage();
        await loadInventoryPage();
      } catch (error) {
        showMessage("adj-msg", error.message, "err");
      }
    });

    document.getElementById("adj-refresh-btn").addEventListener("click", async () => {
      await loadStockAdjustmentPage();
      showMessage("adj-msg", "Movement direfresh", "ok");
    });

    document.getElementById("mv-filter-apply-btn").addEventListener("click", async () => {
      state.inventoryOps.movementFilters = collectMovementFilters();
      await loadStockMovementPage();
      showMessage("mv-msg", "Filter movement diterapkan", "ok");
    });

    document.getElementById("mv-filter-reset-btn").addEventListener("click", async () => {
      state.inventoryOps.movementFilters = {
        inventoryId: "",
        movementType: "",
        reference: "",
        from: "",
        to: ""
      };
      await loadStockMovementPage();
      showMessage("mv-msg", "Filter movement direset", "ok");
    });

    document.getElementById("cafe-create-category-btn").addEventListener("click", async () => {
      try {
        const payload = {
          code: document.getElementById("cafe-category-code").value,
          name: document.getElementById("cafe-category-name").value,
          active: document.getElementById("cafe-category-active").value === "true"
        };
        const created = await cafeClient.createCategory(payload);
        showMessage("cafe-msg", "Kategori dibuat: " + created.code, "ok");
        await loadCafePage();
      } catch (error) {
        showMessage("cafe-msg", error.message, "err");
      }
    });

    document.getElementById("cafe-create-menu-btn").addEventListener("click", async () => {
      try {
        const payload = {
          categoryId: document.getElementById("cafe-menu-category").value,
          code: document.getElementById("cafe-menu-code").value,
          name: document.getElementById("cafe-menu-name").value,
          price: Number(document.getElementById("cafe-menu-price").value || 0),
          stock: Number(document.getElementById("cafe-menu-stock").value || 0),
          active: document.getElementById("cafe-menu-active").value === "true"
        };

        const editId = document.getElementById("cafe-create-menu-btn").getAttribute("data-edit-id") || "";
        if (editId) {
          await cafeClient.updateMenu(editId, payload);
          document.getElementById("cafe-create-menu-btn").removeAttribute("data-edit-id");
          document.getElementById("cafe-create-menu-btn").textContent = "Create Menu";
          showMessage("cafe-msg", "Menu diperbarui", "ok");
        } else {
          const created = await cafeClient.createMenu(payload);
          showMessage("cafe-msg", "Menu dibuat: " + created.code, "ok");
        }

        await loadCafePage();
      } catch (error) {
        showMessage("cafe-msg", error.message, "err");
      }
    });

    document.getElementById("cafe-add-cart-btn").addEventListener("click", () => {
      const menuId = document.getElementById("cafe-order-menu").value;
      const qty = Math.max(1, Number(document.getElementById("cafe-order-qty").value || 1));
      const menu = (state.cafe.menus || []).find((item) => item.id === menuId);
      if (!menu) {
        showMessage("cafe-msg", "Menu tidak ditemukan", "err");
        return;
      }
      if (qty > menu.stock) {
        showMessage("cafe-msg", "Qty melebihi stock menu", "warn");
        return;
      }
      state.cafe.cart.push({
        menuItemId: menu.id,
        menuName: menu.name,
        qty,
        price: menu.price,
        total: menu.price * qty
      });
      renderCafeCart();
      showMessage("cafe-msg", "Menu ditambahkan ke cart", "ok");
    });

    document.getElementById("cafe-clear-cart-btn").addEventListener("click", () => {
      state.cafe.cart = [];
      renderCafeCart();
      showMessage("cafe-msg", "Cart dibersihkan", "warn");
    });

    document.getElementById("cafe-discount").addEventListener("input", () => renderCafeCart());
    document.getElementById("cafe-tax").addEventListener("input", () => renderCafeCart());
    document.getElementById("cafe-table-number").addEventListener("input", () => {
      const value = String(document.getElementById("cafe-table-number").value || "").trim();
      if (value) {
        state.cafe.selectedTable = value.padStart(2, "0");
        renderCafeTableSelector();
        renderCafeCart();
      }
    });

    document.getElementById("cafe-create-order-btn").addEventListener("click", async () => {
      try {
        if (!state.cafe.cart.length) {
          showMessage("cafe-msg", "Tambahkan minimal satu menu ke cart", "warn");
          return;
        }
        const tableNumber = state.cafe.selectedTable || document.getElementById("cafe-table-number").value || "01";
        document.getElementById("cafe-table-number").value = tableNumber;

        const payload = {
          customerName: document.getElementById("cafe-customer-name").value || "Walk In",
          tableNumber,
          orderType: document.getElementById("cafe-order-type").value,
          paymentMethod: document.getElementById("cafe-payment-method").value,
          discount: Number(document.getElementById("cafe-discount").value || 0),
          tax: Number(document.getElementById("cafe-tax").value || 0),
          items: state.cafe.cart.map((item) => ({
            menuItemId: item.menuItemId,
            menuName: item.menuName,
            qty: item.qty,
            price: item.price,
            total: item.total
          }))
        };

        const created = await cafeClient.createOrder(payload);
        state.cafe.currentOrderId = created.id;
        state.cafe.currentOrder = created;
        state.cafe.cart = [];
        renderCafeCart();
        showMessage("cafe-msg", "Order dibuat: " + created.orderNumber, "ok");
        await loadCafePage();
      } catch (error) {
        showMessage("cafe-msg", error.message, "err");
      }
    });

    document.getElementById("cafe-pay-order-btn").addEventListener("click", async () => {
      try {
        const id = state.cafe.currentOrderId;
        if (!id) throw new Error("Pilih order dulu");
        const paymentMethod = document.getElementById("cafe-payment-method").value;
        const paid = await cafeClient.payOrder(id, paymentMethod);
        state.cafe.currentOrder = paid;
        showMessage("cafe-msg", "Pembayaran sukses: " + paid.orderNumber, "ok");
        await loadCafePage();
      } catch (error) {
        showMessage("cafe-msg", error.message, "err");
      }
    });

    document.getElementById("cafe-print-order-btn").addEventListener("click", async () => {
      try {
        const id = state.cafe.currentOrderId;
        if (!id) throw new Error("Pilih order dulu");
        const result = await cafeClient.printOrder(id);
        state.cafe.currentOrder = result.order;
        state.cafe.receipt = result.receipt || "";
        document.getElementById("cafe-receipt").textContent = state.cafe.receipt || "Belum ada receipt";
        showMessage("cafe-msg", "Receipt tercetak: " + result.order.orderNumber, "ok");
        const win = window.open("", "_blank");
        if (win) {
          win.document.write("<html><head><title>Cafe Receipt</title><style>body{font-family:monospace;padding:12px;white-space:pre-wrap}</style></head><body>" + escapeHtml(state.cafe.receipt) + "</body></html>");
          win.document.close();
          win.focus();
          win.print();
        }
        await loadCafePage();
      } catch (error) {
        showMessage("cafe-msg", error.message, "err");
      }
    });

    document.getElementById("cafe-void-order-btn").addEventListener("click", async () => {
      try {
        const id = state.cafe.currentOrderId;
        if (!id) throw new Error("Pilih order dulu");
        const voided = await cafeClient.voidOrder(id);
        state.cafe.currentOrder = voided;
        showMessage("cafe-msg", "Order di-void: " + voided.orderNumber, "warn");
        await loadCafePage();
      } catch (error) {
        showMessage("cafe-msg", error.message, "err");
      }
    });

    document.getElementById("pos-refresh-ticket").addEventListener("click", async () => {
      await loadPosTicketing();
      showMessage("pos-msg", "Data tiket direfresh", "ok");
    });

    document.getElementById("pos-discount").addEventListener("input", () => recalculatePos());
    document.getElementById("pos-tax").addEventListener("input", () => recalculatePos());
    document.getElementById("pos-paid-amount").addEventListener("input", () => recalculatePos());
    document.getElementById("pos-payment-method").addEventListener("change", () => recalculatePos());

    document.getElementById("pos-save-sale").addEventListener("click", async () => {
      try {
        if (!state.pos.items.length) {
          showMessage("pos-msg", "Tambahkan minimal satu item tiket", "warn");
          return;
        }

        const customerName = document.getElementById("pos-customer-name").value || "Walk In";
        const customerPhone = document.getElementById("pos-customer-phone").value || "-";
        const totals = recalculatePos();

        const created = await posTicketingService.createSale({
          customerName,
          customerPhone,
          paymentMethod: totals.paymentMethod,
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          total: totals.total,
          paidAmount: totals.paidAmount,
          changeAmount: totals.changeAmount,
          status: totals.paymentMethod === "CASH" ? "UNPAID" : "PENDING",
          soldAt: new Date().toISOString(),
          items: state.pos.items
        });

        const paid = await posTicketingService.paySale(created.id, {
          paymentMethod: totals.paymentMethod,
          paidAmount: totals.paymentMethod === "CASH" ? totals.paidAmount : totals.total
        });

        showMessage("pos-msg", "Transaksi tersimpan: " + paid.saleNumber + " (" + paid.status + ")", "ok");
        state.pos.currentSaleId = paid.id;
        state.pos.items = [];
        document.getElementById("pos-ticket-qty").value = "1";
        document.getElementById("pos-discount").value = "0";
        document.getElementById("pos-tax").value = "0";
        document.getElementById("pos-paid-amount").value = "0";
        renderPosItems();
        await loadPosTicketing();
        navigate("/ticket-preview/" + paid.id);
      } catch (error) {
        showMessage("pos-msg", error.message, "err");
      }
    });

    document.getElementById("cashier-open-btn").addEventListener("click", async () => {
      try {
        const created = await cashierShiftClient.open({
          cashierId: document.getElementById("cashier-id").value,
          cashierName: document.getElementById("cashier-name").value,
          openingCash: Number(document.getElementById("cashier-opening-cash").value || 0)
        });
        showMessage("cashier-msg", "Shift OPEN: " + created.shiftNumber, "ok");
        await loadCashierPage();
      } catch (error) {
        showMessage("cashier-msg", error.message, "err");
      }
    });

    document.getElementById("cashier-close-btn").addEventListener("click", async () => {
      try {
        const closed = await cashierShiftClient.close({
          closingCash: Number(document.getElementById("cashier-closing-cash").value || 0)
        });
        showMessage("cashier-msg", "Shift CLOSED: " + closed.shiftNumber, "ok");
        await loadCashierPage();
      } catch (error) {
        showMessage("cashier-msg", error.message, "err");
      }
    });

    document.getElementById("cashier-refresh-btn").addEventListener("click", async () => {
      await loadCashierPage();
      showMessage("cashier-msg", "Data shift direfresh", "ok");
    });

    document.getElementById("ticket-preview-refresh").addEventListener("click", async () => {
      const id = state.pos.currentSaleId || location.pathname.split("/").pop();
      if (!id) return;
      await loadTicketPreview(id);
      showMessage("ticket-preview-msg", "Preview direfresh", "ok");
    });

    document.getElementById("ticket-preview-print").addEventListener("click", async () => {
      try {
        const id = state.pos.currentSaleId || location.pathname.split("/").pop();
        if (!id) throw new Error("Ticket id tidak ditemukan");
        const printed = await posTicketingService.printSale(id);
        await loadTicketPreview(id);
        const ticket = state.pos.currentPreview;
        const win = window.open("", "_blank");
        if (win && ticket) {
          win.document.write("<html><head><title>Print Ticket</title><style>body{font-family:monospace;padding:12px;white-space:pre-wrap}</style></head><body>" + escapeHtml(ticket.layout80mm) + "</body></html>");
          win.document.close();
          win.focus();
          win.print();
        }
        showMessage("ticket-preview-msg", "Ticket dicetak: " + printed.ticketNumber, "ok");
      } catch (error) {
        showMessage("ticket-preview-msg", error.message, "err");
      }
    });

    document.getElementById("ticket-preview-void").addEventListener("click", async () => {
      try {
        const id = state.pos.currentSaleId || location.pathname.split("/").pop();
        if (!id) throw new Error("Ticket id tidak ditemukan");
        const result = await posTicketingService.voidSale(id);
        await loadTicketPreview(id);
        showMessage("ticket-preview-msg", "Ticket void: " + result.ticketNumber, "warn");
      } catch (error) {
        showMessage("ticket-preview-msg", error.message, "err");
      }
    });

    document.getElementById("gate-scan-btn").addEventListener("click", async () => {
      try {
        const qrToken = document.getElementById("gate-qr-token").value;
        if (!qrToken) throw new Error("QR token wajib diisi");
        const result = await posTicketingService.checkIn(qrToken);
        document.getElementById("gate-result").innerHTML =
          '<div><strong>VALID</strong></div>' +
          '<div>Ticket Number: ' + escapeHtml(result.ticketNumber) + '</div>' +
          '<div>Nama: ' + escapeHtml(result.customerName) + '</div>' +
          '<div>Status: <span class="status-pill status-' + escapeHtml(result.status) + '">' + escapeHtml(result.status) + '</span></div>';
        showMessage("gate-msg", "VALID", "ok");
      } catch (error) {
        document.getElementById("gate-result").innerHTML = "";
        const message = error.message || "INVALID";
        let label = "INVALID";
        if (message === "ALREADY_CHECKED_IN") label = "ALREADY CHECKED IN";
        if (message === "VOID_TICKET") label = "VOID";
        showMessage("gate-msg", label, message === "INVALID_TICKET" ? "err" : "warn");
      }
    });

    document.getElementById("gate-reset-btn").addEventListener("click", () => {
      resetGatePanel();
    });

    document.getElementById("reservation-detail-refresh-btn").addEventListener("click", async () => {
      const id = state.reservation.currentId || location.pathname.split("/").pop();
      if (!id) return;
      await loadReservationDetail(id);
      showMessage("reservation-detail-msg", "Detail reservation direfresh", "ok");
    });

    document.getElementById("reservation-pay-btn").addEventListener("click", async () => {
      try {
        const id = state.reservation.currentId || location.pathname.split("/").pop();
        if (!id) throw new Error("Reservation id tidak ditemukan");
        const paymentMethod = state.reservation.currentDetail?.paymentMethod || "CASH";
        const paid = await reservationClient.pay(id, paymentMethod);
        await loadReservationDetail(id);
        showMessage("reservation-detail-msg", "Payment sukses: " + paid.bookingNumber, "ok");
      } catch (error) {
        showMessage("reservation-detail-msg", error.message, "err");
      }
    });

    document.getElementById("reservation-confirm-btn").addEventListener("click", async () => {
      try {
        const id = state.reservation.currentId || location.pathname.split("/").pop();
        if (!id) throw new Error("Reservation id tidak ditemukan");
        const confirmed = await reservationClient.confirm(id);
        await loadReservationDetail(id);
        showMessage("reservation-detail-msg", "Reservation confirmed: " + confirmed.bookingNumber, "ok");
      } catch (error) {
        showMessage("reservation-detail-msg", error.message, "err");
      }
    });

    document.getElementById("reservation-checkin-btn").addEventListener("click", async () => {
      try {
        const id = state.reservation.currentId || location.pathname.split("/").pop();
        if (!id) throw new Error("Reservation id tidak ditemukan");
        const checked = await reservationClient.checkIn(id);
        await loadReservationDetail(id);
        showMessage("reservation-detail-msg", "Check-in sukses. TicketSale: " + checked.ticketSaleId, "ok");
      } catch (error) {
        showMessage("reservation-detail-msg", error.message, "err");
      }
    });

    document.getElementById("reservation-cancel-btn").addEventListener("click", async () => {
      try {
        const id = state.reservation.currentId || location.pathname.split("/").pop();
        if (!id) throw new Error("Reservation id tidak ditemukan");
        const cancelled = await reservationClient.cancel(id);
        await loadReservationDetail(id);
        showMessage("reservation-detail-msg", "Reservation dibatalkan: " + cancelled.bookingNumber, "warn");
      } catch (error) {
        showMessage("reservation-detail-msg", error.message, "err");
      }
    });

    document.getElementById("reservation-print-btn").addEventListener("click", () => {
      const detail = state.reservation.currentDetail;
      if (!detail) return;
      const qrHtml = document.getElementById("reservation-detail-qr").innerHTML;
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write("<html><head><title>Print Booking</title><style>body{font-family:Arial,sans-serif;padding:24px}h1{margin:0 0 10px}.meta{margin:6px 0}</style></head><body>");
      win.document.write("<h1>SATSET Reservation</h1>");
      win.document.write("<div class='meta'><strong>Booking:</strong> " + escapeHtml(detail.bookingNumber) + "</div>");
      win.document.write("<div class='meta'><strong>Customer:</strong> " + escapeHtml(detail.customerName) + "</div>");
      win.document.write("<div class='meta'><strong>Visit:</strong> " + escapeHtml(detail.visitDate) + " " + escapeHtml(detail.visitSession) + "</div>");
      win.document.write("<div class='meta'><strong>Status:</strong> " + escapeHtml(detail.reservationStatus) + "</div>");
      win.document.write("<div class='meta'><strong>Total:</strong> " + escapeHtml(formatCurrency(detail.totalAmount || 0)) + "</div>");
      win.document.write("<div style='margin-top:16px'>" + safeQrSvg(qrHtml) + "</div>");
      win.document.write("</body></html>");
      win.document.close();
      win.focus();
      win.print();
    });

    const crudForm = document.getElementById("crud-customer-form");
    if (crudForm) crudForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const payload = {
          code: document.getElementById("crud-code").value,
          fullName: document.getElementById("crud-full-name").value,
          email: document.getElementById("crud-email").value,
          phone: document.getElementById("crud-phone").value
        };

        if (state.customerCrud.editingId) {
          await customerCrudService.update(state.customerCrud.editingId, payload);
          showMessage("crud-customer-msg", "Customer berhasil diperbarui", "ok");
        } else {
          await customerCrudService.create(payload);
          showMessage("crud-customer-msg", "Customer berhasil ditambahkan", "ok");
        }

        resetCustomerCrudForm();
        await loadCustomerCrud();
      } catch (error) {
        showMessage("crud-customer-msg", error.message, "err");
      }
    });

    const crudCancelEdit = document.getElementById("crud-cancel-edit");
    if (crudCancelEdit) crudCancelEdit.addEventListener("click", () => {
      resetCustomerCrudForm();
      showMessage("crud-customer-msg", "Mode edit dibatalkan", "warn");
    });

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

    loadCustomerCrud();
    if (initialPath === "/ticketing") {
      loadPosTicketing();
    }
  </script>
</body>
</html>`;
