/**
 * @file React-Query hooks for deck comments:
 *   • useComments
 *   • useCreateComment
 *   • useDeleteComment
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios-client";

/* ───────────────────────────── Queries ───────────────────────────── */

/**
 * Fetch all comments for a deck.
 * @param {number|undefined} deckId
 */
export const useComments = (deckId) =>
  useQuery({
    enabled: !!deckId,
    queryKey: ["comments", deckId],
    queryFn: async () => {
      const { data } = await api.get(`/decks/${deckId}/comments`);
      return data;
    },
  });

/* ───────────────────────────── Mutations ──────────────────────────── */

/**
 * Add a comment and invalidate the list.
 * @param {number|undefined} deckId
 */
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

/**
 * Delete a comment and invalidate the list.
 * @param {number|undefined} deckId
 */
export const useDeleteComment = (deckId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (commentId) =>
      api.delete(`/decks/${deckId}/comments/${commentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", deckId] }),
  });
};
