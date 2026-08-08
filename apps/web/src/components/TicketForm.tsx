import React from "react";
import type { CreateTicketDto, UpdateTicketDto } from "../dto/TicketDto";
import { useTicket } from "../hooks/useTicket";

export function TicketForm() {
  const { createMutation, updateMutation } = useTicket();

  // TODO: initialize form state.
  const createInitialValue = {} as CreateTicketDto;
  const updateInitialValue = {} as UpdateTicketDto;

  // TODO: load initial value when editing.
  const initialValue = createInitialValue ?? updateInitialValue;

  // TODO: create submit handler.
  const onCreateSubmit = async (payload: CreateTicketDto) => {
    await createMutation.mutateAsync(payload);
  };

  // TODO: update submit handler.
  const onUpdateSubmit = async (payload: UpdateTicketDto) => {
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
