abstract class Entity<T = string> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  public get id(): T {
    return this._id;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (entity.constructor !== this.constructor) {
      return false;
    }

    return this._id === entity._id;
  }
}

abstract class AggregateRoot<T = string> extends Entity<T> {
  protected constructor(id: T) {
    super(id);
  }
}

export type PrintJobProps = {
  jobId: string;
  jobType: "invoice" | "receipt" | "order" | "report";
  content: string;
  contentData: Record<string, unknown>;
  status: "pending" | "printing" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
};

export class PrintJob extends AggregateRoot<string> {
  private props: PrintJobProps;

  constructor(id: string, props: PrintJobProps) {
    super(id);
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.jobId?.trim()) throw new Error("Job ID is required");
    if (!["invoice", "receipt", "order", "report"].includes(this.props.jobType)) {
      throw new Error("Invalid job type");
    }
    if (!this.props.content?.trim()) throw new Error("Content is required");
  }

  public static create(params: {
    id: string;
    jobId: string;
    jobType: "invoice" | "receipt" | "order" | "report";
    content: string;
    contentData: Record<string, unknown>;
  }): PrintJob {
    return new PrintJob(params.id, {
      jobId: params.jobId,
      jobType: params.jobType,
      content: params.content,
      contentData: params.contentData,
      status: "pending",
      createdAt: new Date(),
    });
  }

  public get jobId(): string {
    return this.props.jobId;
  }

  public get jobType(): string {
    return this.props.jobType;
  }

  public get content(): string {
    return this.props.content;
  }

  public get contentData(): Record<string, unknown> {
    return this.props.contentData;
  }

  public get status(): string {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get errorMessage(): string | undefined {
    return this.props.errorMessage;
  }

  public startPrinting(): void {
    if (this.props.status !== "pending") {
      throw new Error("Only pending jobs can start printing");
    }
    this.props.status = "printing";
  }

  public markCompleted(): void {
    if (this.props.status !== "printing") {
      throw new Error("Only printing jobs can be marked as completed");
    }
    this.props.status = "completed";
    this.props.completedAt = new Date();
  }

  public markFailed(errorMessage: string): void {
    this.props.status = "failed";
    this.props.errorMessage = errorMessage;
  }

  public canRetry(): boolean {
    return this.props.status === "failed";
  }

  public retry(): void {
    if (!this.canRetry()) {
      throw new Error("Only failed jobs can be retried");
    }
    this.props.status = "pending";
    this.props.errorMessage = undefined;
  }

  public getWaitTime(): number {
    return Math.floor((Date.now() - this.props.createdAt.getTime()) / 1000);
  }
}
