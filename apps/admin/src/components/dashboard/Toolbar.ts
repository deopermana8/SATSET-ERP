export function renderDashboardToolbar(): string {
  return `<div class="widget-toolbar"><button class="btn btn-o" onclick="toggleWidgetCustomizer()">Atur Widget</button><button class="btn btn-o" onclick="showAllWidgets()">Tampilkan Semua</button><button class="btn btn-o" onclick="renderWidgets()">Render Ulang Widget</button><button class="btn btn-p" onclick="gt('form','destinasi')">Tambah Data</button></div>`;
}
