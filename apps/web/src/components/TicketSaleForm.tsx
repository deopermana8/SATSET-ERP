import React from "react";
import type { CreateTicketSaleDto, UpdateTicketSaleDto } from "../dto/TicketSaleDto";
import { useTicketSale } from "../hooks/useTicketSale";

export function TicketSaleForm() {
  const { createMutation, updateMutation } = useTicketSale();

  // TODO: initialize form state.
  const createInitialValue = {} as CreateTicketSaleDto;
  const updateInitialValue = {} as UpdateTicketSaleDto;

  // TODO: load initial value when editing.
  const initialValue = createInitialValue ?? updateInitialValue;

  // TODO: create submit handler.
  const onCreateSubmit = async (payload: CreateTicketSaleDto) => {
    await createMutation.mutateAsync(payload);
  };

  // TODO: update submit handler.
  const onUpdateSubmit = async (payload: UpdateTicketSaleDto) => {
    await updateMutation.mutateAsync({ id: "", payload });
  };

  // TODO: validation placeholder.
  const validationErrors: string[] = [];

  // TODO: loading state.
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // TODO: error state.
  const error = createMutation.error ?? updateMutation.error;

  return (
    <div>
      {/* TODO: implement form UI */}
      <pre>{JSON.stringify({ initialValue, validationErrors, isLoading, hasError: Boolean(error) })}</pre>
      <button type="button" onClick={() => void onCreateSubmit(createInitialValue)}>Create</button>
      <button type="button" onClick={() => void onUpdateSubmit(updateInitialValue)}>Update</button>
    </div>
  );
}
