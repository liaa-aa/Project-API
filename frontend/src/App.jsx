// src/App.jsx

import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Halaman publik & user
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// Proteksi route
import ProtectedRoute from "./components/ProtectedRoute";

// Halaman admin
import AdminVolunteers from "./pages/AdminVolunteers";
import AdminEvents from "./pages/AdminEvents";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./components/AdminLayout";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar hanya untuk halaman publik/user */}
      {!isAdminRoute && <Navbar />}

      <main className={isAdminRoute ? "flex-1" : "flex-1 pt-0"}>
        <Routes>
          {/* ROUTE PUBLIK & USER */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* AREA ADMIN (semua dibungkus AdminLayout + ProtectedRoute) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* /admin → Dashboard */}
            <Route index element={<AdminDashboard />} />

            {/* /admin/volunteers */}
            <Route path="volunteers" element={<AdminVolunteers />} />

            {/* /admin/events */}
            <Route path="events" element={<AdminEvents />} />

            {/* /admin/users */}
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </main>

      {/* Footer juga hanya tampil di halaman publik/user */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
