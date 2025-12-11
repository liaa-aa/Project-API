// src/pages/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin } from "../api/authApi";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // callback ketika login Google sukses
  const handleGoogleSuccess = async (response) => {
    try {
      const credential = response.credential;
      const data = await googleLogin(credential);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🔥 Cek role, arahkan ke halaman yang tepat
      if (data.user?.role === "admin") {
        navigate("/admin"); // -> AdminLayout + sidebar
      } else {
        navigate("/"); // -> Home user biasa
      }
    } catch (err) {
      console.error(err);
      setError("Gagal login dengan Google.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await login(email, password);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 🔥 Sama di sini: cek role
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Login gagal. Periksa email dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 px-6 py-7 md:px-8">
          {/* HEADER */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Masuk
            </p>
            <h1 className="mt-1 text-xl md:text-2xl font-bold text-slate-900">
              Login ke akun Anda
            </h1>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          {/* GOOGLE LOGIN */}
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login gagal")}
          />

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[11px] text-slate-500">atau</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* FORM EMAIL / PASSWORD */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="contoh@mail.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Kata sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Masukkan kata sandi"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition
                ${
                  loading
                    ? "bg-slate-300 text-slate-600"
                    : "bg-blue-700 text-white hover:bg-blue-800"
                }`}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-[11px] text-slate-500 text-center">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
