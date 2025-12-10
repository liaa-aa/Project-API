// src/pages/EventDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById } from "../api/eventApi";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Jika API menyediakan data cuaca atau kamu punya fungsi fetch cuaca,
  // kamu bisa menambahkannya di sini.
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getEventById(id);
        setEvent(data);
      } catch (err) {
        setError(err.message || "Gagal memuat detail event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <p className="text-sm text-slate-500">Memuat detail event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          {error || "Event tidak ditemukan"}
        </div>
      </div>
    );
  }

  // Hitung kuota relawan
  const max = Number(event.maxVolunteers);
  const current = Number(event.currentVolunteers);

  const hasMax = Number.isFinite(max) && max > 0;
  const hasCurrent = Number.isFinite(current) && current >= 0;

  const isFull = hasMax && hasCurrent && current >= max;
  const remaining = hasMax && hasCurrent ? max - current : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        {/* Tombol kembali */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
        >
          ← Kembali ke daftar event
        </button>

        {/* Card utama */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 md:p-8">
          {/* Judul */}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            {event.title}
          </h1>

          {/* Lokasi, jenis, tanggal */}
          <div className="mt-1 text-sm text-slate-600 flex flex-col gap-1">
            {event.location && <span>Lokasi: {event.location}</span>}

            {event.type && <span>Jenis: {event.type}</span>}

            {event.date && (
              <span>
              Tanggal:{" "}
                {new Date(event.date).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          {/* Deskripsi */}
          {event.description && (
            <p className="mt-6 text-sm text-slate-700 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Kuota relawan */}
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Informasi Relawan
            </h3>

            {hasMax && (
              <p className="text-xs text-slate-600">
                Kuota: <strong>{current}</strong> / <strong>{max}</strong>{" "}
                relawan
              </p>
            )}

            {isFull ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                Event sudah penuh.
              </p>
            ) : remaining !== null ? (
              <p className="mt-1 text-xs font-medium text-emerald-600">
                Slot tersisa: {remaining}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-600">
                Pendaftar saat ini: <strong>{current}</strong> relawan
              </p>
            )}
          </div>

          {/* ACTION BUTTON (Jika kamu ingin tombol Join Event, taruh di sini) */}
          <div className="mt-6">
            <button
              disabled={isFull}
              className={`px-4 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition
                ${
                  isFull
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-blue-700 text-white hover:bg-blue-800"
                }`}
            >
              {isFull ? "Event Penuh" : "Daftar Sebagai Relawan"}
            </button>
          </div>

          {/* Bagian Cuaca (jika ada API-nya) */}
          {weather && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Perkiraan Cuaca
              </h3>
              <p className="text-xs text-slate-600">{weather.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
