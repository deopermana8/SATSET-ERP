import React from "react";
import { TicketTable } from "../components/TicketTable";
import { TicketForm } from "../components/TicketForm";

export function TicketPage() {
  return (
    <div>
      <h1>Ticket</h1>
      <TicketForm />
      <TicketTable />
    </div>
  );
}
