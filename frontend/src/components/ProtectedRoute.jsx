// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // belum login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // kalau ada aturan role, cek
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // misal relawan mencoba akses halaman admin
    return <Navigate to="/" replace />;
  }

  // lolos → render halaman anak
  return children;
}
