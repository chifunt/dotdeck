/**
 * @file Read-only deck queries (single deck + deck list).
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios-client";

/* ─────────────────────────── Single deck ─────────────────────────── */

/**
 * Fetch one deck by numeric ID or slug string.
 * @param {string|number} slugOrId
 */
export const useDeck = (slugOrId) =>
  useQuery({
    queryKey: ["deck", slugOrId],
    enabled: !!slugOrId,
    queryFn: async () => {
      const url =
        typeof slugOrId === "string" && isNaN(Number(slugOrId))
          ? `/decks/slug/${slugOrId}`
          : `/decks/${slugOrId}`;

      const { data } = await api.get(url);
      return data;
    },
  });

/* ─────────────────────────── Deck list ─────────────────────────── */

/**
 * Paginated / filtered deck listing (home, browse, profile…).
 * @param {Record<string, unknown>} [params]
 */
export const useDecks = (params = {}) =>
  useQuery({
    queryKey: ["decks", params],
    queryFn: async () => {
      const { data } = await api.get("/decks", { params });
      return data;
    },
  });
