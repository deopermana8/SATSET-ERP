export type NotificationStoreState = {
  unreadCount: number;
  importantCount: number;
};

export const defaultNotificationStoreState: NotificationStoreState = {
  unreadCount: 0,
  importantCount: 0,
};

export const notificationStoreModule = {
  state: { ...defaultNotificationStoreState },
  setCounts(unreadCount: number, importantCount: number): NotificationStoreState {
    this.state = { unreadCount, importantCount };
    return this.state;
  },
};
