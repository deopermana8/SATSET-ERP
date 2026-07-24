export class TicketId {
  public readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  static generate(): TicketId {
    const random = Math.floor(Math.random() * 1000000).toString(36);
    return new TicketId(`${Date.now().toString(36)}-${random}`);
  }
}

export default TicketId;
