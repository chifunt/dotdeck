/**
 * @file Deck-related React-Query mutations:
 *   create / update / delete deck
 *   vote (thumbs-up / thumbs-down)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios-client";

/** Helper – invalidate deck lists + `/me` cache. */
const invalidate = (qc) => {
  qc.invalidateQueries({ queryKey: ["decks"] });
  qc.invalidateQueries({ queryKey: ["me"] });
};

/* ─────────────────────────── create ─────────────────────────── */

/** POST /decks */
export const useCreateDeck = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => api.post("/decks", payload).then((r) => r.data),
    onSuccess: ({ id }) => {
      toast.success("Deck created");
      invalidate(qc);
      /* caller receives { id } so they can navigate */
    },
    onError: (e) => toast.error(e.response?.data?.message || "Create failed"),
  });
};

/* ─────────────────────────── update ─────────────────────────── */

/** PATCH /decks/:id */
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

/* ─────────────────────────── delete ─────────────────────────── */

/** DELETE /decks/:id */
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

/* ─────────────────────────── vote ─────────────────────────── */

/** POST /decks/:id/ratings   (score = 1 | -1) */
export const useVoteDeck = (id) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (score) => api.post(`/decks/${id}/ratings`, { score }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deck", id] }),
  });
};
