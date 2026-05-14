import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export function useToggleSaved() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.post(`/saved/${id}`, {}),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["saved"] });
      const prev = qc.getQueryData<string[]>(["saved"]);
      qc.setQueryData<string[]>(["saved"], old => {
        if (!old) return [id];
        return old.includes(id) ? old.filter(s => s !== id) : [...old, id];
      });
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      qc.setQueryData(["saved"], ctx?.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["saved"] });
    },
  });
}