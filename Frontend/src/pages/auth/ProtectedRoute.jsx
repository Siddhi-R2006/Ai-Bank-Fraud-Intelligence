import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  // Read session keys from localStorage
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Debugging log to inspect values in Browser Console (F12)
  console.log("ProtectedRoute Check -> Token:", !!token, "| Stored Role:", userRole, "| Required Role:", role);

  // 1. If not authenticated, redirect to choose-role
  if (!token) {
    return <Navigate to="/choose-role" replace />;
  }

  // 2. If user role doesn't match the required route role, redirect to choose-role
  if (role && userRole !== role) {
    return <Navigate to="/choose-role" replace />;
  }

  // 3. Authenticated & Authorized -> Render children (CustomerLayout)
  return children;
}