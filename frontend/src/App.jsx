// frontend/src/App.jsx

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Halaman publik & user
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// Halaman admin
import AdminVolunteers from "./pages/AdminVolunteers";
import AdminEvents from "./pages/AdminEvents";

// Proteksi route
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 pt-0">
        <Routes>
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

          <Route
            path="/admin/volunteers"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminVolunteers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminEvents />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* footer di paling bawah */}
      <Footer />
    </div>
  );
}

export default App;
