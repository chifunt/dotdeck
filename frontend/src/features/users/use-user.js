/**
 * @file Public user profile + their decks – GET /users/:username
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios-client";

/**
 * Fetch user profile (and their decks) by username.
 * @param {string} username
 */
export const useUser = (username) =>
  useQuery({
    enabled: !!username,
    queryKey: ["user", username],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}`);
      return data;
    },
  });
