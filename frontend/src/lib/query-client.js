/**
 * @file Shared React-Query client instance.
 * All hooks import this so we have a single cache across the SPA.
 */

import { QueryClient } from "@tanstack/react-query";

/** 1-minute “fresh” window to avoid hammering the API on tab-switch. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // milliseconds
    },
  },
});
