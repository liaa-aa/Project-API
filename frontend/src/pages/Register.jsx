// src/pages/Register.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authApi"; // sesuaikan dengan project-mu

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { token, user } = await register(fullName, email, password);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess("Pendaftaran berhasil! Mengalihkan ke dashboard...");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Pendaftaran gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 px-6 py-7 md:px-8">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Daftar
            </p>
            <h1 className="mt-1 text-xl md:text-2xl font-bold text-slate-900">
              Buat akun baru
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
              {success}
            </div>
          )}

          {/* FORM REGISTER */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama lengkap */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Nama lengkap
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                          placeholder:text-slate-400 text-slate-900
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Andi Pratama"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                          placeholder:text-slate-400 text-slate-900
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contoh@mail.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Kata sandi
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                          placeholder:text-slate-400 text-slate-900
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minimal 6 karakter"
              />
            </div>

            {/* Tombol submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition
                ${
                  loading
                    ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                    : "bg-blue-700 text-white hover:bg-blue-800"
                }`}
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-[11px] text-slate-500 text-center">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
