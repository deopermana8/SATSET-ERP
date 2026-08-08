import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../api/CustomerApi";
import type { CreateCustomerDto, UpdateCustomerDto } from "../dto/CustomerDto";

export function useCustomer() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["customer", "list"],
    queryFn: () => customerApi.getAll()
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCustomerDto) => customerApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customer", "list"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerDto }) => customerApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customer", "list"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customer", "list"] });
    }
  });

  return {
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation
  };
}
