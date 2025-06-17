/**
 * @file Application entry-point.
 * Wraps the SPA in all top-level providers (React-Query, Router, Toasts).
 */

import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { queryClient } from "@/lib/query-client";
import { Router } from "@/router";

/**
 * Root React component – never unmounts during the session.
 *
 * @returns {JSX.Element} React element tree with global providers.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>

      {/* Global toast notifications (top-right, Rose Pine colours). */}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
