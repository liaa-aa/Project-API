// src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  if (!token || !userRaw) {
    // Belum login
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch {
    // Data user korup, anggap belum login
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // Kalau butuh role tertentu (misalnya admin)
  if (requiredRole && user.role !== requiredRole) {
    // Bisa diarahkan ke home / 403, di sini aku arahkan ke home
    return <Navigate to="/" replace />;
  }

  // Lolos semua cek → render child
  return children;
};

export default ProtectedRoute;
