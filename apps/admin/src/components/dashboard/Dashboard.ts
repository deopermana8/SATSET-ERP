import { DashboardCharts } from "./DashboardCharts.js";
import { DashboardHeader } from "./DashboardHeader.js";
import { DashboardInsight } from "./DashboardInsight.js";
import { DashboardStats } from "./DashboardStats.js";
import { DashboardSummary } from "./DashboardSummary.js";
import { DashboardTimeline } from "./DashboardTimeline.js";
import { DashboardWidgets } from "./DashboardWidgets.js";

export function Dashboard(): string {
  return `<section id="v-dash">${DashboardHeader()}${DashboardStats()}${DashboardSummary()}${DashboardInsight()}${DashboardCharts()}${DashboardTimeline()}${DashboardWidgets()}</section>`;
}
