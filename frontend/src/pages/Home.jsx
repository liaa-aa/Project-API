import React from "react";
import heroImage from "../assets/hero.png";

const Home = () => {
  return (
    <div className="pt-0 pb-15 bg-slate-50">
      {/* ===== HERO SECTION (lebih modern) ===== */}
      <section className="relative max-w-6xl mx-auto mt-4 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-white shadow-md overflow-hidden px-6 py-10 md:px-10 md:py-14">
        {/* dekorasi blur */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-52 w-52 rounded-full bg-blue-900/25 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          {/* KIRI: TEKS */}
          <div className="flex-1">
            <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur">
              Platform Relawan Indonesia
            </span>

            <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
              Selamat Datang di{" "}
              <span className="text-yellow-300">Volunteer Event App</span>
            </h1>

            <p className="mt-4 text-blue-50 text-base md:text-lg max-w-xl">
              Yuk ikut kegiatan sosial dan bareng-bareng bikin perubahan kecil
              yang berarti.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => (window.location.href = "/events")}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg text-sm md:text-base font-semibold hover:bg-blue-50 shadow"
              >
                Lihat Kegiatan
              </button>

              <button
                onClick={() => (window.location.href = "/login")}
                className="px-6 py-3 border border-white/70 text-white rounded-lg text-sm md:text-base font-medium hover:bg-white/10"
              >
                Daftar Jadi Relawan
              </button>
            </div>
          </div>

          {/* KANAN: GAMBAR DALAM CARD */}
          <div className="flex-1 flex justify-center">
            <div className="relative rounded-2xl bg-white shadow-2xl p-2 md:p-3">
              <img
                src={heroImage}
                alt="Relawan membantu"
                className="w-full max-w-md rounded-xl object-cover"
              />

              <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/80 px-3 py-2 text-xs md:text-sm text-blue-900 shadow-md">
                <p className="flex justify-center font-semibold">Aksi Cepat Bantu Sesama</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-h-96 max-w-6xl mx-auto mt-9 text-center px-6 py-20 overflow-hidden">
        {/* ===== DECORATION LEFT ===== */}
        {/* Bulatan besar kiri */}
        <div className="absolute left-10 mt-2 bottom-5 w-48 h-48 bg-yellow-200 opacity-40 rounded-full hidden md:block" />

        {/* Ring putus-putus kiri */}
        <div className="absolute left-30 top-7 w-25 h-25 rounded-full border-4 border-dashed border-blue-200 opacity-70 hidden md:block" />

        {/* ===== DECORATION RIGHT ===== */}
        {/* Bulatan besar kanan (diperkecil) */}
        <div className="absolute right-13 bottom-0 w-48 h-48 bg-cyan-200 opacity-40 rounded-full hidden md:block" />

        {/* Ring putus-putus kanan (diperkecil) */}
        <div className="absolute right-25 top-7 w-24 h-24 rounded-full border-4 border-dashed border-blue-400 opacity-60 hidden md:block" />

        {/* Ring putus-putus tambahan kanan (yang kamu minta) */}
        <div className="absolute right-5 top-32 w-20 h-20 rounded-full border-2 border-dashed border-blue-300 opacity-50 hidden md:block" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Bergabunglah Menjadi Relawan
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Kami percaya bahwa setiap orang dapat memberi dampak positif. Yuk
            ikut berkontribusi lewat berbagai kegiatan sosial, lingkungan, dan
            kemanusiaan.
          </p>
        </div>
      </section>

      {/* ===== FEATURE CARDS ===== */}
      <section className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 pb-6">
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">
            Membantu Sesama
          </h3>
          <p className="text-gray-600">
            Jadilah bagian dari perubahan di lingkungan kamu dengan aksi nyata.
          </p>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">
            Event Fleksibel
          </h3>
          <p className="text-gray-600">
            Pilih kegiatan sesuai lokasi, jadwal, dan minat kamu.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">
            Bertemu Relawan Baru
          </h3>
          <p className="text-gray-600">
            Berjejaring dengan komunitas positif dan relawan inspiratif.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
