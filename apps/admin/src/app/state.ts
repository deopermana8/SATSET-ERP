import type { DashboardState } from "../state/dashboard.js";
import type { FormState } from "../state/form.js";
import type { NotificationState } from "../state/notification.js";
import type { SearchState } from "../state/search.js";
import type { TableState } from "../state/table.js";
import type { ThemeState } from "../state/theme.js";
import type { UserState } from "../state/user.js";
import type { WorkspaceState } from "../state/workspace.js";

export type AppState = {
  dashboard: DashboardState;
  table: TableState;
  form: FormState;
  notification: NotificationState;
  search: SearchState;
  theme: ThemeState;
  user: UserState;
  workspace: WorkspaceState;
};
