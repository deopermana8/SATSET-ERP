import React from "react";
import { TicketSaleTable } from "../components/TicketSaleTable";
import { TicketSaleForm } from "../components/TicketSaleForm";

export function TicketSalePage() {
  return (
    <div>
      <h1>TicketSale</h1>
      <TicketSaleForm />
      <TicketSaleTable />
    </div>
  );
}
