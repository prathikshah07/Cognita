// hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useTransactions = () => {
  return useQuery(["transactions"], async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return data;
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (transaction: any) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert([transaction]);
      if (error) throw error;
      return data;
    },
    { onSuccess: () => queryClient.invalidateQueries(["transactions"]) }
  );
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    { onSuccess: () => queryClient.invalidateQueries(["transactions"]) }
  );
};

// Similar hooks can be created for budgets
