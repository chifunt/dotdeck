/**
 * @file Placeholder admin console – gated behind `RequireAuth role="admin"`.
 */

import { Navbar } from "@/layouts/navbar";
import { RequireAuth } from "@/features/auth/require-auth";

export function AdminPage() {
  return (
    <RequireAuth role="admin">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Admin console</h1>
        <p className="text-sm text-rosePine-muted">
          Stub – hook up tables & mutations when the moderation workflow is
          ready.
        </p>
      </div>
    </RequireAuth>
  );
}
