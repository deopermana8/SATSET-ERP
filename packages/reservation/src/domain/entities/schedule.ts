export type ScheduleWindow = {
  start: Date;
  end: Date;
};

export class Schedule {
  public readonly start: Date;
  public readonly end: Date;

  constructor(params: ScheduleWindow) {
    if (!(params.start instanceof Date) || isNaN(params.start.valueOf())) {
      throw new Error("Schedule start must be a valid date");
    }

    if (!(params.end instanceof Date) || isNaN(params.end.valueOf())) {
      throw new Error("Schedule end must be a valid date");
    }

    if (params.start >= params.end) {
      throw new Error("Schedule end must be after start");
    }

    this.start = params.start;
    this.end = params.end;
  }

  public includes(date: Date): boolean {
    return this.start <= date && date <= this.end;
  }

  public overlaps(other: Schedule): boolean {
    return this.start < other.end && other.start < this.end;
  }
}
