import { getDashboardIcon } from "../../app/dashboard/iconRegistry.js";

export function renderActionPanel(): string {
  const icon = {
    add: getDashboardIcon("action"),
    reserve: getDashboardIcon("timeline"),
    payment: getDashboardIcon("health"),
    invoice: getDashboardIcon("summary"),
    report: getDashboardIcon("chart"),
    export: getDashboardIcon("chevronRight"),
    import: getDashboardIcon("search"),
    sync: getDashboardIcon("dashboard"),
    backup: getDashboardIcon("command"),
    ticketSale: getDashboardIcon("dashboard"),
    ticketScan: getDashboardIcon("search"),
    cafe: getDashboardIcon("summary"),
    outbound: getDashboardIcon("chart"),
    kitchen: getDashboardIcon("timeline"),
    receipt: getDashboardIcon("chevronRight"),
    shift: getDashboardIcon("health"),
    sales: getDashboardIcon("command"),
    attendance: getDashboardIcon("timeline"),
    equipment: getDashboardIcon("summary"),
    instructor: getDashboardIcon("health"),
    finance: getDashboardIcon("summary"),
    accounting: getDashboardIcon("command"),
  };
  return `<div class="qa-grid" id="quick-actions">
    <button class="qa-btn" onclick="gt('list','ticketing')"><span class="qa-ic">${icon.ticketSale}</span><span class="qa-n">Ticket</span></button>
    <button class="qa-btn" onclick="gt('list','reservasi')"><span class="qa-ic">${icon.reserve}</span><span class="qa-n">Booking</span></button>
    <button class="qa-btn" onclick="gt('list','cafe')"><span class="qa-ic">${icon.cafe}</span><span class="qa-n">Cafe</span></button>
    <button class="qa-btn" onclick="gt('list','outbound')"><span class="qa-ic">${icon.outbound}</span><span class="qa-n">Outbound</span></button>
    <button class="qa-btn" onclick="gt('list','finance')"><span class="qa-ic">${icon.finance}</span><span class="qa-n">Finance</span></button>
    <button class="qa-btn" onclick="gt('list','accounting')"><span class="qa-ic">${icon.accounting}</span><span class="qa-n">Accounting</span></button>
    <button class="qa-btn" onclick="openTicketScanner()"><span class="qa-ic">${icon.ticketScan}</span><span class="qa-n">Scanner</span></button>
    <button class="qa-btn" onclick="openCafeKitchenDisplay()"><span class="qa-ic">${icon.kitchen}</span><span class="qa-n">Kitchen</span></button>
    <button class="qa-btn" onclick="gt('form','reservasi')"><span class="qa-ic">${icon.reserve}</span><span class="qa-n">Reservasi Baru</span></button>
    <button class="qa-btn" onclick="quickTicketSale()"><span class="qa-ic">${icon.ticketSale}</span><span class="qa-n">Penjualan Tiket</span></button>
    <button class="qa-btn" onclick="openTicketScanner()"><span class="qa-ic">${icon.ticketScan}</span><span class="qa-n">Scan Tiket</span></button>
    <button class="qa-btn" onclick="openCafePos()"><span class="qa-ic">${icon.cafe}</span><span class="qa-n">POS Cafe</span></button>
    <button class="qa-btn" onclick="quickCafeOrder()"><span class="qa-ic">${icon.add}</span><span class="qa-n">Order Baru</span></button>
    <button class="qa-btn" onclick="openCafeKitchenDisplay()"><span class="qa-ic">${icon.kitchen}</span><span class="qa-n">Dapur</span></button>
    <button class="qa-btn" onclick="printLatestCafeReceipt()"><span class="qa-ic">${icon.receipt}</span><span class="qa-n">Cetak Struk</span></button>
    <button class="qa-btn" onclick="closeCafeShift()"><span class="qa-ic">${icon.shift}</span><span class="qa-n">Tutup Shift</span></button>
    <button class="qa-btn" onclick="openCafeSalesHistory()"><span class="qa-ic">${icon.sales}</span><span class="qa-n">Riwayat Penjualan</span></button>
    <button class="qa-btn" onclick="openOutboundBooking()"><span class="qa-ic">${icon.outbound}</span><span class="qa-n">Booking Outbound</span></button>
    <button class="qa-btn" onclick="openOutboundCheckIn()"><span class="qa-ic">${icon.ticketScan}</span><span class="qa-n">Check In</span></button>
    <button class="qa-btn" onclick="markOutboundAttendanceQuick()"><span class="qa-ic">${icon.attendance}</span><span class="qa-n">Absensi</span></button>
    <button class="qa-btn" onclick="openOutboundSchedule()"><span class="qa-ic">${icon.outbound}</span><span class="qa-n">Jadwal</span></button>
    <button class="qa-btn" onclick="openOutboundEquipment()"><span class="qa-ic">${icon.equipment}</span><span class="qa-n">Peralatan</span></button>
    <button class="qa-btn" onclick="openOutboundInstructor()"><span class="qa-ic">${icon.instructor}</span><span class="qa-n">Instruktur</span></button>
    <button class="qa-btn" onclick="openOutboundReport()"><span class="qa-ic">${icon.report}</span><span class="qa-n">Laporan Outbound</span></button>
    <button class="qa-btn" onclick="openFinanceCashIn()"><span class="qa-ic">${icon.finance}</span><span class="qa-n">Kas Masuk</span></button>
    <button class="qa-btn" onclick="openFinanceCashOut()"><span class="qa-ic">${icon.finance}</span><span class="qa-n">Kas Keluar</span></button>
    <button class="qa-btn" onclick="openFinanceTransfer()"><span class="qa-ic">${icon.finance}</span><span class="qa-n">Transfer Bank</span></button>
    <button class="qa-btn" onclick="openFinanceReconcile()"><span class="qa-ic">${icon.finance}</span><span class="qa-n">Rekonsiliasi</span></button>
    <button class="qa-btn" onclick="openFinanceReport()"><span class="qa-ic">${icon.report}</span><span class="qa-n">Laporan Keuangan</span></button>
    <button class="qa-btn" onclick="openOutboundReport()"><span class="qa-ic">${icon.report}</span><span class="qa-n">Laporan</span></button>
    <button class="qa-btn" onclick="openAccountingJournalInput()"><span class="qa-ic">${icon.accounting}</span><span class="qa-n">Input Jurnal</span></button>
    <button class="qa-btn" onclick="postLatestAccountingJournal()"><span class="qa-ic">${icon.accounting}</span><span class="qa-n">Posting Jurnal</span></button>
    <button class="qa-btn" onclick="openAccountingLedger()"><span class="qa-ic">${icon.accounting}</span><span class="qa-n">Buku Besar</span></button>
    <button class="qa-btn" onclick="openAccountingTrialBalance()"><span class="qa-ic">${icon.accounting}</span><span class="qa-n">Neraca Saldo</span></button>
    <button class="qa-btn" onclick="openAccountingIncomeStatement()"><span class="qa-ic">${icon.accounting}</span><span class="qa-n">Laba Rugi</span></button>
    <button class="qa-btn" onclick="openAccountingBalanceSheet()"><span class="qa-ic">${icon.accounting}</span><span class="qa-n">Neraca</span></button>
    <button class="qa-btn" onclick="closeAccountingBook()"><span class="qa-ic">${icon.accounting}</span><span class="qa-n">Closing Buku</span></button>
    <button class="qa-btn" onclick="gt('list','jurnal')"><span class="qa-ic">${icon.report}</span><span class="qa-n">Laporan</span></button>
    <button class="qa-btn" onclick="gt('form','destinasi')"><span class="qa-ic">${icon.add}</span><span class="qa-n">Tambah Data</span></button>
    <button class="qa-btn" onclick="gt('form','pembayaran')"><span class="qa-ic">${icon.payment}</span><span class="qa-n">Pembayaran</span></button>
    <button class="qa-btn" onclick="gt('list','pembayaran')"><span class="qa-ic">${icon.invoice}</span><span class="qa-n">Invoice</span></button>
    <button class="qa-btn" onclick="expCSV()"><span class="qa-ic">${icon.export}</span><span class="qa-n">Ekspor</span></button>
    <button class="qa-btn" onclick="triggerImport()"><span class="qa-ic">${icon.import}</span><span class="qa-n">Impor</span></button>
    <button class="qa-btn" onclick="rld()"><span class="qa-ic">${icon.sync}</span><span class="qa-n">Sinkronisasi</span></button>
    <button class="qa-btn" onclick="toast('Backup dijadwalkan','success')"><span class="qa-ic">${icon.backup}</span><span class="qa-n">Backup</span></button>
  </div>`;
}
