import { cx, el, type AttrValue } from "../utils/index.js";

type Attrs = Record<string, AttrValue>;

type BoxProps = {
  className?: string;
  attrs?: Attrs;
  children?: string;
};

type LabelProps = BoxProps & {
  label?: string;
};

function box(tag: string, baseClass: string, props: BoxProps = {}): string {
  return el(tag, { class: cx(baseClass, props.className), ...(props.attrs ?? {}) }, props.children ?? "");
}

function labeled(tag: string, baseClass: string, props: LabelProps = {}): string {
  return box(tag, baseClass, { ...props, children: props.children ?? props.label ?? "" });
}

export const Button = (props: LabelProps = {}): string => labeled("button", "ds-btn", props);
export const IconButton = (props: LabelProps = {}): string => labeled("button", "ds-icon-btn", props);
export const Card = (props: BoxProps = {}): string => box("section", "ds-card", props);
export const GlassCard = (props: BoxProps = {}): string => box("section", "ds-card ds-glass", props);
export const Input = (props: BoxProps = {}): string => box("input", "ds-input", props);
export const Textarea = (props: BoxProps = {}): string => box("textarea", "ds-textarea", props);
export const Select = (props: BoxProps = {}): string => box("select", "ds-select", props);
export const Checkbox = (props: BoxProps = {}): string => box("input", "ds-checkbox", { ...props, attrs: { type: "checkbox", ...(props.attrs ?? {}) } });
export const Radio = (props: BoxProps = {}): string => box("input", "ds-radio", { ...props, attrs: { type: "radio", ...(props.attrs ?? {}) } });
export const Switch = (props: BoxProps = {}): string => box("button", "ds-switch", props);
export const Toggle = (props: BoxProps = {}): string => box("button", "ds-toggle", props);
export const Badge = (props: LabelProps = {}): string => labeled("span", "ds-badge", props);
export const Chip = (props: LabelProps = {}): string => labeled("span", "ds-chip", props);
export const Alert = (props: BoxProps = {}): string => box("div", "ds-alert", props);
export const Avatar = (props: LabelProps = {}): string => labeled("span", "ds-avatar", props);
export const Tooltip = (props: BoxProps = {}): string => box("span", "ds-tooltip", props);
export const Popover = (props: BoxProps = {}): string => box("div", "ds-popover", props);
export const Dropdown = (props: BoxProps = {}): string => box("div", "ds-dropdown", props);
export const Menu = (props: BoxProps = {}): string => box("div", "ds-menu", props);
export const Dialog = (props: BoxProps = {}): string => box("div", "ds-dialog", props);
export const Drawer = (props: BoxProps = {}): string => box("aside", "ds-drawer", props);
export const Modal = (props: BoxProps = {}): string => box("div", "ds-modal", props);
export const Toast = (props: LabelProps = {}): string => labeled("div", "ds-toast", props);
export const Tabs = (props: BoxProps = {}): string => box("div", "ds-tabs", props);
export const Accordion = (props: BoxProps = {}): string => box("div", "ds-accordion", props);
export const Stepper = (props: BoxProps = {}): string => box("ol", "ds-stepper", props);
export const Breadcrumb = (props: BoxProps = {}): string => box("nav", "ds-breadcrumb", props);
export const Sidebar = (props: BoxProps = {}): string => box("aside", "ds-sidebar", props);
export const Topbar = (props: BoxProps = {}): string => box("header", "ds-topbar", props);
export const CommandPalette = (props: BoxProps = {}): string => box("div", "ds-command-palette", props);
export const SearchBox = (props: BoxProps = {}): string => box("div", "ds-search-box", props);
export const Calendar = (props: BoxProps = {}): string => box("div", "ds-calendar", props);
export const DatePicker = (props: BoxProps = {}): string => box("div", "ds-datepicker", props);
export const Table = (props: BoxProps = {}): string => box("table", "ds-table", props);
export const DataTable = (props: BoxProps = {}): string => box("div", "ds-data-table", props);
export const DataGrid = (props: BoxProps = {}): string => box("div", "ds-data-grid", props);
export const Pagination = (props: BoxProps = {}): string => box("nav", "ds-pagination", props);
export const StatCard = (props: BoxProps = {}): string => box("section", "ds-stat-card", props);
export const MetricCard = (props: BoxProps = {}): string => box("section", "ds-metric-card", props);
export const Progress = (props: BoxProps = {}): string => box("div", "ds-progress", props);
export const Timeline = (props: BoxProps = {}): string => box("div", "ds-timeline", props);
export const ActivityFeed = (props: BoxProps = {}): string => box("div", "ds-activity-feed", props);
export const Notification = (props: LabelProps = {}): string => labeled("div", "ds-notification", props);
export const Skeleton = (props: BoxProps = {}): string => box("div", "ds-skeleton", props);
export const Spinner = (props: BoxProps = {}): string => box("div", "ds-spinner", props);
export const EmptyState = (props: LabelProps = {}): string => labeled("div", "ds-empty-state", props);
export const ErrorState = (props: LabelProps = {}): string => labeled("div", "ds-error-state", props);
export const LoadingOverlay = (props: BoxProps = {}): string => box("div", "ds-loading-overlay", props);
