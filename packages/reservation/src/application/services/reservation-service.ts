import { Reservation } from "../../domain/entities/reservation";
import { Quotation } from "../../domain/entities/quotation";
import { Invoice, InvoiceStatus as InvoiceStatusEnum } from "../../domain/entities/invoice";
import { Payment } from "../../domain/entities/payment";
import { ReservationCreated } from "../../domain/events/reservation-created";
import { ReservationConfirmed } from "../../domain/events/reservation-confirmed";
import { PaymentReceived } from "../../domain/events/payment-received";
import { TicketIssued } from "../../domain/events/ticket-issued";
import { QuotationStatus } from "../../domain/value-objects/quotation-status";
import { ReservationId } from "../../domain/value-objects/reservation-id";
import { Guest } from "../../domain/entities/guest";
import { Package as ReservationPackage } from "../../domain/entities/package";
import { Schedule } from "../../domain/entities/schedule";
import { GuestCount } from "../../domain/value-objects/guest-count";
import { WorkflowDashboardStore } from "@satset/shared";

export type ReservationServiceResult<T> = {
  item: T;
  events: Array<ReservationCreated | ReservationConfirmed | PaymentReceived | TicketIssued>;
};

export class ReservationService {
  constructor(private readonly dashboard: WorkflowDashboardStore) {}

  public createReservation(params: {
    reservationId: ReservationId;
    guest: Guest;
    reservationPackage: ReservationPackage;
    schedule: Schedule;
    guestCount: GuestCount;
    notes?: string;
  }): ReservationServiceResult<Reservation> {
    const reservation = Reservation.createPending({
      reservationId: params.reservationId,
      guest: params.guest,
      reservationPackage: params.reservationPackage,
      schedule: params.schedule,
      guestCount: params.guestCount,
      notes: params.notes,
    });

    reservation.ensureAvailability();
    const event = new ReservationCreated({ reservationId: reservation.reservationId, occurredAt: new Date() });

    this.dashboard.increment("reservations");

    return { item: reservation, events: [event] };
  }

  public createQuotation(reservationId: ReservationId, totalAmount: number): ReservationServiceResult<Quotation> {
    const quotation = new Quotation(`quotation-${reservationId.value}`, {
      reservationId,
      totalAmount,
      lineItems: [{ description: "Reservation package", unitPrice: totalAmount, quantity: 1 }],
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      status: QuotationStatus.DRAFT,
    });

    quotation.markFinal();
    this.dashboard.increment("quotations");

    return { item: quotation, events: [] };
  }

  public createInvoice(reservationId: ReservationId, amount: number): ReservationServiceResult<Invoice> {
    const invoice = new Invoice(`invoice-${reservationId.value}`, {
      reservationId,
      invoiceNumber: `INV-${reservationId.value}`,
      lineItems: [{ description: "Reservation", amount }],
      totalAmount: amount,
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      status: InvoiceStatusEnum.UNPAID,
    });

    this.dashboard.increment("invoices");

    return { item: invoice, events: [] };
  }

  public receivePayment(reservationId: ReservationId, amount: number, method: string): ReservationServiceResult<Payment> {
    const payment = new Payment(`payment-${reservationId.value}`, {
      reservationId,
      amount,
      method,
      receivedAt: new Date(),
      reference: `PAY-${reservationId.value}`,
    });

    const event = new PaymentReceived({ reservationId, amount, receivedAt: payment.receivedAt, reference: payment.reference });

    this.dashboard.increment("payments");

    return { item: payment, events: [event] };
  }

  public issueTicket(reservationId: ReservationId, ticketNumber: string): ReservationServiceResult<null> {
    const event = new TicketIssued({ reservationId, ticketNumber, issuedAt: new Date() });
    this.dashboard.increment("tickets");
    return { item: null, events: [event] };
  }
}
