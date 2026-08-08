export interface ActivityScheduleDto {
  id: string;
  activityId: string;
  date: string;
  session: string;
  capacity: number;
  booked: number;
  available: number;
}

export interface CreateActivityScheduleDto {
  activityId: string;
  date: string;
  session: string;
  capacity: number;
}
