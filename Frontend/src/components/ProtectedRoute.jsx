import { Navigate } from "react-router-dom";
import { getSession } from "../lib/auth";

export default function ProtectedRoute({ role, children }) {
  const session = getSession();
  if (!session) return <Navigate to="/choose-role" replace />;
  if (session.role !== role) {
    return <Navigate to={session.role === "admin" ? "/admin/dashboard" : "/customer/dashboard"} replace />;
  }
  return children;
}
