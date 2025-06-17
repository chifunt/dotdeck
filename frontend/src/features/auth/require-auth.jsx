import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";

export function RequireAuth({ children, role }) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;

  if (role === "admin" && user.role !== "admin")
    return <Navigate to="/" replace />;

  return children;
}
