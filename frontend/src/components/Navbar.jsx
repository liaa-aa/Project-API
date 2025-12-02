// src/components/Navbar.jsx

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // simpan user di state supaya UI bisa berubah ketika logout/login
  const [user, setUser] = useState(null);

  // Baca ulang user dari localStorage setiap kali URL berubah
  useEffect(() => {
    const raw = localStorage.getItem("user");

    if (!raw) {
      setUser(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setUser(parsed);
    } catch (e) {
      console.error("Gagal parse user dari localStorage", e);
      setUser(null);
    }
  }, [location]); // <-- jalan lagi tiap route berubah (termasuk setelah navigate)

  const handleLogout = () => {
    // bersihkan localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // reset state user supaya navbar LANGSUNG berubah
    setUser(null);

    // pindah ke halaman login
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">
          VolunteerEvent
        </Link>

        <div className="flex items-center gap-4">
          {/* HOME */}
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>

          <Link to="/events" className="hover:text-blue-600">
            Events
          </Link>

          {user ? (
            <>
              {/* Menu khusus admin */}
              {user.role === "admin" && (
                <>
                  <Link to="/admin/volunteers" className="hover:text-blue-600">
                    Admin Volunteers
                  </Link>
                  <Link to="/admin/events" className="hover:text-blue-600">
                    Admin Events
                  </Link>
                </>
              )}

              <Link to="/profile" className="hover:text-blue-600">
                Profil
              </Link>

              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="hover:text-blue-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
