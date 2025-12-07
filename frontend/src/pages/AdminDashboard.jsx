// src/pages/AdminDashboard.jsx

import { Link } from "react-router-dom";

export default function AdminDashboard() {
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {
    // abaikan
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 border border-blue-100">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-blue-700">
            Dashboard Admin
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Kontrol penuh dalam satu tampilan.
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Pantau event, relawan, dan pengguna untuk memastikan sistem
              berjalan dengan baik.
            </p>
            {user && (
              <p className="text-sm text-slate-700 mt-2">
                Selamat datang,{" "}
                <span className="font-semibold text-blue-700">
                  {user.name || user.email}
                </span>
                .
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-xl bg-yellow-300 px-3 py-1 text-xs font-semibold text-blue-900 shadow-sm">
              ⚡ Akses penuh admin
            </span>
          </div>
        </div>
      </header>

      {/* Quick stats (placeholder, bisa nanti diisi data dari API) */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 flex flex-col gap-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Relawan
          </p>
          <p className="text-lg font-bold text-slate-900">–</p>
          <p className="text-[11px] text-slate-500">
            Total relawan terdaftar pada berbagai event.
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 flex flex-col gap-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Event / Bencana
          </p>
          <p className="text-lg font-bold text-slate-900">–</p>
          <p className="text-[11px] text-slate-500">
            Monitoring jumlah event yang sedang aktif & arsip.
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 flex flex-col gap-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Pengguna
          </p>
          <p className="text-lg font-bold text-slate-900">–</p>
          <p className="text-[11px] text-slate-500">
            Ringkasan akun yang terdaftar pada sistem.
          </p>
        </div>
      </section>

      {/* Kartu navigasi utama */}
      <section className="grid gap-4 md:grid-cols-3">
        <Link
          to="/admin/volunteers"
          className="group bg-gradient-to-br from-white via-white to-blue-50 rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">Data Relawan</h3>
            <span className="text-[11px] font-medium text-blue-700 group-hover:text-blue-800">
              Kelola
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Lihat dan kelola pendaftaran relawan pada setiap event/bencana.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-blue-700 group-hover:text-blue-800">
            <span>Detail relawan</span>
            <span>→</span>
          </div>
        </Link>

        <Link
          to="/admin/events"
          className="group bg-gradient-to-br from-white via-white to-yellow-50 rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">
              Data Event / Bencana
            </h3>
            <span className="text-[11px] font-medium text-blue-700 group-hover:text-blue-800">
              Kelola
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Tambah, ubah, atau arsipkan event/bencana yang tampil di aplikasi.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-blue-700 group-hover:text-blue-800">
            <span>Manajemen event</span>
            <span>→</span>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="group bg-gradient-to-br from-white via-white to-slate-50 rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">Data Pengguna</h3>
            <span className="text-[11px] font-medium text-blue-700 group-hover:text-blue-800">
              Kelola
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Kelola akun pengguna, akses, dan informasi profil dengan mudah.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-blue-700 group-hover:text-blue-800">
            <span>Manajemen pengguna</span>
            <span>→</span>
          </div>
        </Link>
      </section>
    </div>
  );
}
