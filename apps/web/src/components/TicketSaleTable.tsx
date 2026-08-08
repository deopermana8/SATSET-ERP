import { useTicketSale } from "../hooks/useTicketSale";

export function TicketSaleTable() {
  const { listQuery } = useTicketSale();

  // TODO: render loading state.
  if (listQuery.isLoading) {
    return null;
  }

  // TODO: render error state.
  if (listQuery.isError) {
    return null;
  }

  // TODO: render empty state.
  if (!listQuery.data || (Array.isArray(listQuery.data) && listQuery.data.length === 0)) {
    return null;
  }

  // TODO: render table rows and columns.
  return null;
}
