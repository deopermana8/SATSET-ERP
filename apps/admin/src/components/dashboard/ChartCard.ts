export function renderChartCard(chartId: string): string {
  return `<svg id="${chartId}" class="chart" height="180" viewBox="0 0 560 180" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Grafik ${chartId}"></svg>`;
}
