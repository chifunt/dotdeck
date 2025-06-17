/**
 * @file <RequireAuth/> ― Route-guard component.
 * Redirects unauthenticated visitors to `/login`.
 * Optionally enforces an `admin` role.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

/**
 * Protect a route (or subsection) behind authentication.
 *
 * @param {object}   props
 * @param {React.ReactNode} props.children  Protected JSX subtree.
 * @param {"admin"} [props.role]            Required role (currently only `"admin"`).
 */
export function RequireAuth({ children, role }) {
  const { user } = useAuth();
  const loc = useLocation();

  /* 1 – Not logged in → bounce to Login, saving current location. */
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;

  /* 2 – Logged in but lacking the required role. */
  if (role === "admin" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  /* 3 – All good → render normally. */
  return children;
}
