import React from "react";
import heroImage from "../assets/hero.png"; // gambar kamu

const Home = () => {
  return (
    <div className="pt-10">
      {/* ===== HERO SECTION ===== */}
      <section className="relative h-[450px] w-full overflow-hidden rounded-lg shadow">
        {/* background image */}
        <img
          src={heroImage}
          alt="Volunteer"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-blue-900/30"></div>

        {/* text content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Selamat Datang di Volunteer Event App
          </h1>

          <p className="text-lg md:text-xl text-blue-100 mt-3">
            Ayo ikut kegiatan sosial dan bantu sesama!
          </p>

          <button
            onClick={() => (window.location.href = "/events")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 shadow"
          >
            Lihat Kegiatan
          </button>
        </div>
      </section>

      {/* ===== MIDDLE SECTION ===== */}
      <section className="max-w-5xl mx-auto mt-16 text-center px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Bergabunglah Menjadi Relawan
        </h2>
        <p className="text-gray-600 leading-relaxed text-lg">
          Kami percaya bahwa setiap orang dapat memberi dampak positif. Yuk ikut
          berkontribusi melalui berbagai kegiatan sosial, lingkungan, dan
          kemanusiaan.
        </p>
      </section>

      {/* ===== FEATURE CARDS ===== */}
      <section className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 pb-20">
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
