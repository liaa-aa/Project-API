// src/pages/Login.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, googleLogin } from "../api/authApi";

// ambil client id dari .env (sudah ada di project-mu)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------
  // LOGIN EMAIL + PASSWORD
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password); // { token, user }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin/volunteers");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login gagal, periksa email/password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // CALLBACK GOOGLE LOGIN
  // --------------------------
  const handleGoogleResponse = async (response) => {
    try {
      setError("");
      setLoading(true);

      const idToken = response?.credential;
      if (!idToken) {
        setError("Token Google tidak ditemukan");
        return;
      }

      // panggil API google login di backend
      const data = await googleLogin(idToken); // { token, user }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin/volunteers");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Google login error FE:", err);
      setError(err?.message || "Login Google gagal");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // INIT GOOGLE IDENTITY + RENDER BUTTON
  // --------------------------
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID belum di-set di .env frontend");
      return;
    }

    const scriptId = "google-identity-script";

    function initializeGoogle() {
      if (
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.id
      ) {
        console.warn("Google Identity belum tersedia di window");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      const btnDiv = document.getElementById("googleSignInDiv");
      if (btnDiv) {
        window.google.accounts.id.renderButton(btnDiv, {
          theme: "outline",
          size: "large",
          width: 320, // HARUS angka, bukan "100%"
          shape: "pill",
        });
        // optional: otomatis munculkan One Tap
        // window.google.accounts.id.prompt();
      }
    }

    // kalau script belum ada → buat
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else {
      // script sudah ada → langsung init
      initializeGoogle();
    }
  }, [handleGoogleResponse]);

  // --------------------------
  // RENDER UI
  // --------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* tombol Login dengan Google */}
        <div id="googleSignInDiv" className="mb-4 flex justify-center" />

        {/* pemisah / divider */}
        <div className="flex items-center my-4">
          <div className="grow border-t border-gray-200" />
          <span className="px-2 text-xs text-gray-500">
            atau login dengan email
          </span>
          <div className="grow border-t border-gray-200" />
        </div>

        {/* form login biasa */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
