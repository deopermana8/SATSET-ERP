export type NotificationCategory = "success" | "warning" | "info" | "error" | "support";

export type NotificationItem = {
  id: string;
  cat: NotificationCategory;
  title: string;
  desc: string;
  at: number;
  unread: boolean;
};
