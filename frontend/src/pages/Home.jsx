// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-0 pb-16">
      {/* ===== HERO SECTION ===== */}
      <section className="relative max-w-6xl mx-auto mt-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 shadow-xl px-6 py-10 md:px-12 md:py-14">
          {/* dekorasi blur */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-52 w-52 rounded-full bg-blue-900/25 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            {/* KIRI: TEKS */}
            <div className="flex-1">
              <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs font-medium text-blue-50 backdrop-blur">
                Platform Relawan Bencana • Indonesia
              </span>

              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white leading-tight">
                Bantu Sesama,{" "}
                <span className="text-yellow-300">Dimulai dari Satu Aksi</span>
              </h1>

              <p className="mt-3 text-sm md:text-base text-blue-50/90 max-w-xl">
                VolunteerEvent menghubungkan relawan dengan berbagai kegiatan
                penanggulangan bencana di seluruh Indonesia. Daftar, pilih
                event, dan mulai bergerak bersama.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/events"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  Lihat Event
                  <span className="ml-2 text-base">→</span>
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-4 py-2 text-xs md:text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  Daftar Sebagai Relawan
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 max-w-md text-xs text-blue-50/90">
                <div>
                  <p className="font-semibold text-white">+100</p>
                  <p>Relawan aktif</p>
                </div>
                <div>
                  <p className="font-semibold text-white">+20</p>
                  <p>Event penanggulangan</p>
                </div>
                <div>
                  <p className="font-semibold text-white">24/7</p>
                  <p>Dukungan platform</p>
                </div>
              </div>
            </div>

            {/* KANAN: GAMBAR */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-4 rounded-3xl bg-blue-900/40 blur-xl" />
                <img
                  src={heroImage}
                  alt="Relawan membantu di lokasi bencana"
                  className="relative rounded-3xl shadow-2xl border border-white/10 w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION: CARA KERJA ===== */}
      <section className="max-w-6xl mx-auto mt-12 px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Cara Kerja
            </p>
            <h2 className="mt-1 text-xl md:text-2xl font-bold text-slate-900">
              Mulai dalam beberapa langkah sederhana
            </h2>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Kami merancang alur pendaftaran yang mudah agar kamu bisa fokus
              pada aksi, bukan administrasi.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StepCard
            number="1"
            title="Buat Akun Relawan"
            desc="Daftar dengan email atau akun Google. Lengkapi profil dan minat lokasi."
          />
          <StepCard
            number="2"
            title="Pilih Event yang Tersedia"
            desc="Telusuri daftar event bencana, lihat detail kebutuhan, dan kuota relawan."
          />
          <StepCard
            number="3"
            title="Datang & Berkontribusi"
            desc="Ikuti arahan koordinator lapangan dan berikan dampak nyata bagi sesama."
          />
        </div>
      </section>

      {/* ===== SECTION: MANFAAT BERGABUNG ===== */}
      <section className="max-w-6xl mx-auto mt-12 px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Mengapa VolunteerEvent?
            </p>
            <h2 className="mt-1 text-xl md:text-2xl font-bold text-slate-900">
              Manfaat bergabung sebagai relawan
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <BenefitCard
            title="Terhubung dengan Kegiatan Nyata"
            desc="Ikut serta dalam penanganan bencana yang benar-benar membutuhkan bantuan di lapangan."
          />
          <BenefitCard
            title="Pengalaman & Jejaring Baru"
            desc="Bertemu relawan dari berbagai latar belakang dan bangun jejaring sosial yang positif."
          />
          <BenefitCard
            title="Platform Terpusat & Transparan"
            desc="Semua informasi event, kebutuhan relawan, dan status pendaftaran dalam satu platform."
          />
        </div>
      </section>
    </div>
  );
};

const StepCard = ({ number, title, desc }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition transform p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
        {number}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    </div>
    <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

const BenefitCard = ({ title, desc }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition transform p-5">
    <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default Home;
