// frontend/src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        setUser(JSON.parse(userRaw));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]); // update setiap ganti halaman

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isLoggedIn = !!user;

  return (
    <nav className="bg-white shadow p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-lg">
          VolunteerApp
        </Link>

        <div className="flex gap-4 items-center text-sm">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>

          {isLoggedIn && user.role === "relawan" && (
            <>
              <Link to="/profile">Profile</Link>
            </>
          )}

          {isLoggedIn && user.role === "admin" && (
            <>
              <Link to="/admin/volunteers">Manage Volunteers</Link>
              {/* bisa ditambah Manage Events dsb */}
            </>
          )}

          {isLoggedIn ? (
            <>
              <span className="text-gray-500">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
