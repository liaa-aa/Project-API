import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const login = localStorage.getItem("token");

  if (!login) return <Navigate to="/login" />;
  return children;
}
