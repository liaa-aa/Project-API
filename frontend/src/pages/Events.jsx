// frontend/src/pages/Events.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../api/eventApi";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getEvents(); // <- pakai API GraphQL yang sudah ada
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Gagal memuat event");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-16">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-semibold uppercase tracking-wide text-blue-600">
            Daftar Kegiatan
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Temukan kegiatan relawan yang dapat kamu ikuti untuk membantu sesama
            dan menyalurkan kepedulianmu.
          </p>
        </header>

        {/* Error */}
        {error && !loading && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Loading / kosong / daftar event */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <p className="text-sm text-slate-500">Memuat data event...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-5 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              Belum ada event yang tersedia saat ini.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Silakan cek kembali beberapa saat lagi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {events.map((ev) => {
              const id = ev.id || ev._id;

              const max = Number(ev.maxVolunteers);
              const current = Number(ev.currentVolunteers);

              const hasMax = Number.isFinite(max) && max > 0;
              const hasCurrent = Number.isFinite(current) && current >= 0;

              const isFull = hasMax && hasCurrent && current >= max;
              const remaining = hasMax && hasCurrent ? max - current : null;

              return (
                <Link
                  key={id}
                  to={`/events/${id}`}
                  className="group bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden
                             hover:shadow-lg hover:-translate-y-0.5 transition transform flex flex-col"
                >
                  {/* Photo Bencana */}
                  {ev.photo && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={ev.photo}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-base md:text-lg text-slate-900 group-hover:text-blue-700">
                        {ev.title}
                      </h2>

                      {ev.location && (
                        <p className="mt-1 text-xs text-slate-500">
                          {ev.location}
                        </p>
                      )}

                      {ev.type && (
                        <p className="mt-1 text-xs text-slate-500">
                          Jenis: {ev.type}
                        </p>
                      )}

                      {ev.date && (
                        <p className="mt-1 text-xs text-slate-500">
                          {" "}
                          {new Date(ev.date).toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>

                    {/* Badge status */}
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                        ${
                          isFull
                            ? "bg-red-50 text-red-700 border border-red-100"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}
                    >
                      {isFull ? "Penuh" : "Terbuka"}
                    </span>
                  </div>

                  {/* Deskripsi */}
                  {ev.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {ev.description}
                    </p>
                  )}

                  {/* Info kuota */}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    {hasMax && (
                      <span>
                        Kuota: <span className="font-medium">{current}</span>/
                        <span className="font-medium">{max}</span> relawan
                      </span>
                    )}

                    {hasCurrent && !hasMax && (
                      <span>
                        Pendaftar:{" "}
                        <span className="font-medium">{current}</span> relawan
                      </span>
                    )}

                    {typeof remaining === "number" && !isFull && (
                      <span className="font-medium text-emerald-600">
                        Slot tersisa: {remaining}
                      </span>
                    )}

                    {isFull && (
                      <span className="font-medium text-red-600">
                        Event sudah penuh
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <span className="inline-flex items-center text-xs font-medium text-blue-700 group-hover:text-blue-800">
                      Lihat detail
                      <span className="ml-1">→</span>
                    </span>
                  </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
