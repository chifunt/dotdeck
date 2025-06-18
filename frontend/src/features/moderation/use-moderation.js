import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios-client";
import { toast } from "sonner";

/* Soft-delete a deck */
export const useSoftDeleteDeck = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/moderation/decks/${id}/soft-delete`),
    onSuccess: () => {
      toast.success("Deck removed");
      qc.invalidateQueries({ queryKey: ["deck", id] });
      qc.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

/* Soft-delete a comment */
export const useSoftDeleteComment = (id) =>
  useMutation({
    mutationFn: () => api.patch(`/moderation/comments/${id}/soft-delete`),
    onSuccess: () => toast.success("Comment removed"),
  });
