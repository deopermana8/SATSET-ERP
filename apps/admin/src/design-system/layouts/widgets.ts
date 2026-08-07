import { ActivityFeed, Card, MetricCard, Notification, StatCard } from "../components/index.js";

export function RevenueCard(value: string): string {
  return MetricCard({ children: `<h4>Revenue</h4><p>${value}</p>` });
}

export function ReservationCard(value: string): string {
  return StatCard({ children: `<h4>Reservation</h4><p>${value}</p>` });
}

export function OccupancyCard(value: string): string {
  return StatCard({ children: `<h4>Occupancy</h4><p>${value}</p>` });
}

export function BookingCard(value: string): string {
  return StatCard({ children: `<h4>Booking</h4><p>${value}</p>` });
}

export function ChartCard(content: string): string {
  return Card({ children: content });
}

export function CalendarWidget(content: string): string {
  return Card({ children: `<h4>Calendar</h4>${content}` });
}

export function TaskWidget(content: string): string {
  return Card({ children: `<h4>Task</h4>${content}` });
}

export function QuickActionWidget(content: string): string {
  return Card({ children: `<h4>Quick Action</h4>${content}` });
}

export function RecentActivity(content: string): string {
  return ActivityFeed({ children: content });
}

export function NotificationWidget(content: string): string {
  return Notification({ children: content });
}
