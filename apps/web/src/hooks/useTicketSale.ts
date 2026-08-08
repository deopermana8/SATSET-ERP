import { useMutation, useQuery } from "@tanstack/react-query";
import { ticketSaleApi } from "../api/TicketSaleApi";

export function useTicketSale() {
  const listQuery = useQuery({
    queryKey: ["ticketSale", "list"],
    queryFn: () => ticketSaleApi.getAll()
  });

  const createMutation = useMutation({
    mutationFn: (payload) => ticketSaleApi.create(payload)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => ticketSaleApi.update(id, payload)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ticketSaleApi.delete(id)
  });

  // TODO: add invalidation strategy and optimistic updates.
  return {
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation
  };
}
