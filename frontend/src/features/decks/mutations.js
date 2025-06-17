import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/axios-client";
import { toast } from "sonner";

const invalidate = (qc) => {
  qc.invalidateQueries({ queryKey: ["decks"] });
  qc.invalidateQueries({ queryKey: ["me"] });
};

export const useCreateDeck = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/decks", payload).then((r) => r.data),
    onSuccess: ({ id }) => {
      toast.success("Deck created");
      invalidate(qc);
      // return id to caller so it can navigate
    },
    onError: (e) => toast.error(e.response?.data?.message || "Create failed"),
  });
};

export const useUpdateDeck = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.patch(`/decks/${id}`, payload),
    onSuccess: () => {
      toast.success("Saved");
      invalidate(qc);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Save failed"),
  });
};

export const useDeleteDeck = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/decks/${id}`),
    onSuccess: () => {
      toast.success("Deck deleted");
      invalidate(qc);
    },
  });
};

export const useVoteDeck = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (score) => api.post(`/decks/${id}/ratings`, { score }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deck", id] }),
  });
};
