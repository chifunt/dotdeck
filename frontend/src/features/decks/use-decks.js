import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/axios-client";

export const useDeck = (slugOrId) =>
  useQuery({
    queryKey: ["deck", slugOrId],
    queryFn: async () => {
      const url =
        typeof slugOrId === "string" && isNaN(Number(slugOrId))
          ? `/decks/slug/${slugOrId}`
          : `/decks/${slugOrId}`;
      const { data } = await api.get(url);
      return data;
    },
  });

// Deck listing (home / browse / profile)
export const useDecks = (params = {}) =>
  useQuery({
    queryKey: ["decks", params],
    queryFn: async () => {
      const { data } = await api.get("/decks", { params });
      return data;
    },
  });
