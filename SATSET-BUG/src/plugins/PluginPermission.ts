export type PluginPermission =
  | "filesystem.read"
  | "filesystem.write"
  | "knowledge.read"
  | "knowledge.write"
  | "runtime.metrics"
  | "event.subscribe"
  | "event.publish"
  | "dashboard.update";

export interface PluginPermissionCheck {
  permission: PluginPermission;
  granted: boolean;
}
