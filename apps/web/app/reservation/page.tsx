"use client";

import React, { useState } from "react";
import { CreateQuotation } from "../../../../packages/reservation/src/application/commands/create-quotation";
import { CreateReservation } from "../../../../packages/reservation/src/application/commands/create-reservation";
import { Guest } from "../../../../packages/reservation/src/domain/entities/guest";
import { Package as ReservationPackage } from "../../../../packages/reservation/src/domain/entities/package";
import { Schedule } from "../../../../packages/reservation/src/domain/entities/schedule";
import { GuestCount } from "../../../../packages/reservation/src/domain/value-objects/guest-count";
import { ReservationId } from "../../../../packages/reservation/src/domain/value-objects/reservation-id";
import { InMemoryReservationRepository } from "../../../../packages/reservation/src/infrastructure/repository/in-memory-reservation-repository";

type LineItem = {
  description: string;
  unitPrice: number;
  quantity: number;
};

type Quotation = {
  id: string;
  status: {
    toString(): string;
  } | string;
  expiresAt: Date | string;
  lineItems: LineItem[];
  totalAmount: number;
};

export default function ReservationPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [packageCode, setPackageCode] = useState("PKG-A");
  const [packageName, setPackageName] = useState("Paket A");
  const [capacity, setCapacity] = useState(10);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [quotation, setQuotation] = useState<Quotation | null>(null);

  const repoRef = React.useRef<InMemoryReservationRepository | null>(null);

  if (repoRef.current === null) {
    repoRef.current = new InMemoryReservationRepository();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Processing...");

    try {
      const reservationId = new ReservationId(
        String(Date.now() + Math.floor(Math.random() * 9999))
      );

      const guest = new Guest({
        name: name || "Tamu",
        email: email || undefined,
        phone: phone || undefined,
      });

      const pkg = new ReservationPackage({
        code: packageCode,
        name: packageName,
        capacity: Number(capacity),
      });

      const schedule = new Schedule({
        start: new Date(start || Date.now()),
        end: new Date(end || Date.now() + 3600 * 1000),
      });

      const gc = new GuestCount(Number(guestCount));

      const createReservation = new CreateReservation(repoRef.current);

      const reservation = await createReservation.execute({
        reservationId,
        guest,
        reservationPackage: pkg,
        schedule,
        guestCount: gc,
        notes,
      });

      const createQuotation = new CreateQuotation(repoRef.current);

      const result = (await createQuotation.execute({
        quotationId: `Q-${reservationId.toString()}`,
        reservationId,
        reservation,
        lineItems: [
          {
            description: pkg.name,
            unitPrice: 100,
            quantity: gc.value,
          },
        ],
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      })) as Quotation;

      setQuotation(result);
      setStatus(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : String(err);

      setStatus(`Error: ${message}`);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Reservation (UI Prototype)</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div>
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <hr />

        <div>
          <label>Package Code</label>
          <input
            value={packageCode}
            onChange={(e) => setPackageCode(e.target.value)}
          />
        </div>

        <div>
          <label>Package Name</label>
          <input
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
          />
        </div>

        <div>
          <label>Package Capacity</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>

        <hr />

        <div>
          <label>Schedule Start</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div>
          <label>Schedule End</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <div>
          <label>Guest Count</label>
          <input
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit">Simpan</button>
        </div>
      </form>

      {status && (
        <div style={{ marginTop: 16 }}>
          <strong>Status:</strong> {status}
        </div>
      )}

      {quotation && (
        <section
          style={{
            marginTop: 20,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 6,
          }}
        >
          <h2>Quotation Preview</h2>

          <div>
            <strong>ID:</strong> {quotation.id}
          </div>

          <div>
            <strong>Status:</strong>{" "}
            {typeof quotation.status === "string"
              ? quotation.status
              : quotation.status.toString()}
          </div>

          <div>
            <strong>Expires:</strong>{" "}
            {new Date(quotation.expiresAt).toString()}
          </div>

          <div>
            <strong>Line Items</strong>

            <ul>
              {quotation.lineItems.map((item, idx) => (
                <li key={idx}>
                  {item.description} — {item.quantity} × {item.unitPrice} ={" "}
                  {item.quantity * item.unitPrice}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Total:</strong> {quotation.totalAmount}
          </div>
        </section>
      )}
    </main>
  );
}