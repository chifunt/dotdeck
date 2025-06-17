/**
 * @file Fetch the global tag list (`/tags?all=1`).
 * Caches the result for 1 hour.
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios-client";

export const useTags = () =>
  useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await api.get("/tags", { params: { all: 1 } });
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
