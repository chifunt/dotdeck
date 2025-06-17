import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/axios-client";

export const useUser = (username) =>
  useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}`);
      return data;
    },
  });
