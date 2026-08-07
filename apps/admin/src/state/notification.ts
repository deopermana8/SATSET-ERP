import type { NotificationItem } from "../types/notification.js";

export type NotificationState = {
  activeCategory: string;
  unreadCount: number;
  items: NotificationItem[];
};

export const defaultNotificationState: NotificationState = {
  activeCategory: "all",
  unreadCount: 0,
  items: [],
};

export const notificationState = {
  defaultState: defaultNotificationState,
  actions: {
    setCategory(state: NotificationState, activeCategory: string): NotificationState {
      return { ...state, activeCategory };
    },
    setItems(state: NotificationState, items: NotificationItem[]): NotificationState {
      const unreadCount = items.filter((item) => item.unread).length;
      return { ...state, items, unreadCount };
    },
    markAllRead(state: NotificationState): NotificationState {
      const items = state.items.map((item) => ({ ...item, unread: false }));
      return { ...state, items, unreadCount: 0 };
    },
  },
  selectors: {
    unreadCount(state: NotificationState): number {
      return state.unreadCount;
    },
    visibleItems(state: NotificationState): NotificationItem[] {
      if (state.activeCategory === "all") {
        return state.items;
      }
      return state.items.filter((item) => item.cat === state.activeCategory);
    },
  },
  helper: {
    hasUnread(state: NotificationState): boolean {
      return state.unreadCount > 0;
    },
  },
};
