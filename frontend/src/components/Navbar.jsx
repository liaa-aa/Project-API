// src/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Baca user dari localStorage saat mount
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      setUser(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setUser(parsed);
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="font-bold text-lg text-blue-600">
            RelawanBencana
          </Link>
        </div>

        {/* Menu kanan */}
        <div className="flex items-center gap-4 text-sm">
          {/* Link umum */}
          <Link to="/events" className="hover:text-blue-600">
            Events
          </Link>

          {user ? (
            <>
              {/* Kalau admin, tampilkan menu admin */}
              {user.role === "admin" && (
                <>
                  <Link
                    to="/admin/volunteers"
                    className="hover:text-blue-600"
                  >
                    Admin Volunteers
                  </Link>
                  <Link to="/admin/events" className="hover:text-blue-600">
                    Admin Events
                  </Link>
                </>
              )}

              {/* Profil */}
              <Link to="/profile" className="hover:text-blue-600">
                Profile
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded bg-red-500 text-white text-xs"
              >
                Logout
              </button>
            </>
          ) : (
            // Kalau belum login
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
