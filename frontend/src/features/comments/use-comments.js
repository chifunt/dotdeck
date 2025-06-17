import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/axios-client";
import { toast } from "sonner";

export const useComments = (deckId) =>
  useQuery({
    queryKey: ["comments", deckId],
    queryFn: async () => {
      const { data } = await api.get(`/decks/${deckId}/comments`);
      return data;
    },
  });

export const useCreateComment = (deckId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post(`/decks/${deckId}/comments`, { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", deckId] });
      toast.success("Comment added");
    },
  });
};

export const useDeleteComment = (deckId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId) =>
      api.delete(`/decks/${deckId}/comments/${commentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", deckId] }),
  });
};
