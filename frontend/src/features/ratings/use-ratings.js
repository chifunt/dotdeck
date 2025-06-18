/**
 * @file Voting helpers – fetch totals + optimistic toggle (v2)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios-client";

/* ─────────────── Fetch totals + myVote ─────────────── */

export const useRatings = (id) =>
  useQuery({
    enabled: !!id,
    queryKey: ["ratings", id],
    queryFn: async () => {
      const { data } = await api.get(`/decks/${id}/ratings`);
      // server returns { upvotes, downvotes, myVote }
      return { myVote: 0, ...data }; // ensure key always exists
    },
  });

/* ─────────────── Optimistic toggle mutation ─────────────── */

export const useToggleVote = (id) => {
  const qc = useQueryClient();

  return useMutation({
    /** @param {1|-1|0} newScore */
    mutationFn: (newScore) =>
      newScore === 0
        ? api.delete(`/decks/${id}/ratings`)
        : api.post(`/decks/${id}/ratings`, { score: newScore }),

    /* ------- optimistic update ------- */
    onMutate: async (newScore) => {
      await qc.cancelQueries({ queryKey: ["ratings", id] });

      /** previous ratings cache (may be undefined on first click) */
      const prevRatings = qc.getQueryData(["ratings", id]);

      /** attempt to grab counts from the deck query as a bootstrap */
      const deckKey = qc
        .getQueryCache()
        .findAll("deck")
        .find(
          (q) => q.queryKey[1] === id || q.queryKey[1] === String(id),
        )?.queryKey;

      const deckData = deckKey ? qc.getQueryData(deckKey) : null;

      /** current state we will mutate from */
      const base = prevRatings ?? {
        upvotes: deckData?.upvotes ?? 0,
        downvotes: deckData?.downvotes ?? 0,
        myVote: 0,
      };

      let { upvotes, downvotes, myVote } = base;

      /* ------------ compute next ------------- */
      if (newScore === 0) {
        if (myVote === 1) upvotes -= 1;
        if (myVote === -1) downvotes -= 1;
        myVote = 0;
      } else if (newScore === 1) {
        if (myVote === 0) upvotes += 1;
        if (myVote === -1) {
          upvotes += 1;
          downvotes -= 1;
        }
        myVote = 1;
      } else if (newScore === -1) {
        if (myVote === 0) downvotes += 1;
        if (myVote === 1) {
          upvotes -= 1;
          downvotes += 1;
        }
        myVote = -1;
      }

      const next = { upvotes, downvotes, myVote };

      /* write back to ratings cache */
      qc.setQueryData(["ratings", id], next);

      /* also patch the deck cache so any fall-through UI sees the change */
      if (deckKey && deckData) {
        qc.setQueryData(deckKey, { ...deckData, ...next });
      }

      return { prevRatings, deckKey, deckData };
    },

    /* ------- rollback on failure ------- */
    onError: (_err, _newScore, ctx) => {
      if (ctx?.prevRatings) qc.setQueryData(["ratings", id], ctx.prevRatings);
      if (ctx?.deckKey && ctx?.deckData)
        qc.setQueryData(ctx.deckKey, ctx.deckData);
    },

    /* ------- merge server reply (counters) ------- */
    onSuccess: (resp, newScore) => {
      // resp?.data may be { upvotes, downvotes }
      const srv = resp?.data ?? {};
      qc.setQueryData(["ratings", id], (cur) => {
        if (!cur) return cur; // safety
        return { ...cur, ...srv }; // keep myVote from cur
      });

      // reflect the new counters inside the deck cache as well
      const deckKey = qc
        .getQueryCache()
        .findAll("deck")
        .find(
          (q) => q.queryKey[1] === id || q.queryKey[1] === String(id),
        )?.queryKey;

      if (deckKey) {
        qc.setQueryData(deckKey, (d) => (d ? { ...d, ...srv } : d));
      }
    },
  });
};
