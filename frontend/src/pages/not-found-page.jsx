/**
 * @file Simple 404 fallback – rendered by the router’s catch-all route.
 */

export function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p>Page not found.</p>
    </div>
  );
}
