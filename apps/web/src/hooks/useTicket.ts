import { useMutation, useQuery } from "@tanstack/react-query";
import { ticketApi } from "../api/TicketApi";

export function useTicket() {
  const listQuery = useQuery({
    queryKey: ["ticket", "list"],
    queryFn: () => ticketApi.getAll()
  });

  const createMutation = useMutation({
    mutationFn: (payload) => ticketApi.create(payload)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => ticketApi.update(id, payload)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ticketApi.delete(id)
  });

  // TODO: add invalidation strategy and optimistic updates.
  return {
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation
  };
}
