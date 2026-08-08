import React from "react";
import { CustomerTable } from "../components/CustomerTable";
import { CustomerForm } from "../components/CustomerForm";
import type { CustomerItem } from "../dto/CustomerDto";

export function CustomerPage() {
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerItem | null>(null);

  return (
    <div>
      <h1>Customer</h1>
      <CustomerForm
        selectedCustomer={selectedCustomer}
        onDoneEditing={() => setSelectedCustomer(null)}
      />
      <CustomerTable
        selectedCustomerId={selectedCustomer?.id ?? null}
        onEdit={(item) => setSelectedCustomer(item)}
      />
    </div>
  );
}
