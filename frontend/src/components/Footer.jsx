export default function Footer() {
  return (
    <footer className="mt-0 w-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-white py-8">
      <div className="relative max-w-6xl mx-auto px-4 text-center space-y-2">
        {/* dekorasi blur kalau mau, tapi ini tidak memengaruhi tinggi */}
        {/* 
        <div className="pointer-events-none absolute -top-16 -left-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-blue-900/25 blur-3xl" />
        */}

        <h2 className="text-lg md:text-xl font-semibold tracking-wide">
          Volunteer Event App
        </h2>
        <p className="text-xs md:text-sm text-blue-50">
          Menghubungkan relawan dengan aksi sosial yang berdampak.
        </p>

        <div className="border-t border-white/25 mt-4 pt-3">
          <p className="text-xs md:text-sm text-white/80">
            © 2025 Volunteer Event Platform — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
