import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/axios-client";

export const useTags = () =>
  useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await api.get("/tags?all=1");
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
