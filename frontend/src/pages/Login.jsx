// frontend/src/pages/Login.jsx

import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin } from "../api/authApi";
import { useState, useEffect, useRef } from "react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const googleButtonRef = useRef(null);

  useEffect(() => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.warn("VITE_GOOGLE_CLIENT_ID belum di-set di .env");
    return;
  }

  // pastikan script GIS sudah loaded
  if (!window.google || !window.google.accounts || !googleButtonRef.current) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async (response) => {
      // response.credential = idToken dari Google
      try {
        const data = await googleLogin(response.credential);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/");
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat login Google");
      }
    },
  });

  window.google.accounts.id.renderButton(googleButtonRef.current, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "pill",
    width: 300,
  });
}, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      // simpan token & user ke localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/"); // bisa diarahkan ke /profile kalau mau
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 rounded mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Masuk atau Daftar
      </h2>

      {/* Button Google */}
      <div className="w-full flex justify-center mb-4">
  <div ref={googleButtonRef}></div>
</div>


      <div className="flex items-center my-4">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="mx-2 text-gray-500 text-sm">atau</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}

      {/* Form login email + password */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="border p-2 rounded w-full"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="border p-2 rounded w-full"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        Belum punya akun?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Daftar dengan email
        </Link>
      </p>
    </div>
  );
}
