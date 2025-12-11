// src/pages/EventDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWeatherForEvent } from "../api/weatherApi";
import {
  getEventById,
  joinEvent,
  getMyRegistrations,
  cancelEventRegistration,
} from "../api/eventApi";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState("");

  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [info, setInfo] = useState("");

  // cari pendaftaran user untuk event ini
  const myRegistration = useMemo(() => {
    if (!registrations || !id) return null;
    return registrations.find((reg) => String(reg.bencanaId) === String(id));
  }, [registrations, id]);

  const isRegistered = !!myRegistration;
  const registrationStatus = myRegistration?.status || null;

  // Ambil detail event
  useEffect(() => {
    const fetchEvent = async () => {
      setLoadingEvent(true);
      setError("");
      try {
        const data = await getEventById(id);
        if (!data) {
          setError("Event tidak ditemukan");
        } else {
          setEvent(data);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Gagal memuat detail event");
      } finally {
        setLoadingEvent(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  // Ambil cuaca
  useEffect(() => {
    const fetchWeather = async () => {
      if (!id) return;
      setLoadingWeather(true);
      try {
        const data = await getWeatherForEvent(id);
        // simpan inner weather saja ke state:
        // { city, country, temp, feelsLike, humidity, description, icon, windSpeed }
        setWeather(data?.weather || null);
      } catch (err) {
        console.error("Gagal mengambil cuaca:", err);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [id]);

  // Ambil semua pendaftaran user
  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoadingRegistrations(true);
      try {
        const data = await getMyRegistrations();
        setRegistrations(data);
      } catch (err) {
        console.error("Gagal mengambil pendaftaran:", err);
      } finally {
        setLoadingRegistrations(false);
      }
    };

    fetchRegistrations();
  }, []);

  const handleJoin = async () => {
    if (!id) return;
    setActionLoading(true);
    setInfo("");
    try {
      const res = await joinEvent(id);
      setInfo(res.message || "Berhasil mendaftar sebagai relawan");

      if (res.data) {
        // tambahkan ke daftar pendaftaran
        setRegistrations((prev) => [...prev, res.data]);
      } else {
        const fresh = await getMyRegistrations();
        setRegistrations(fresh);
      }
    } catch (err) {
      console.error(err);
      setInfo(err.message || "Gagal mendaftar sebagai relawan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm("Yakin ingin membatalkan pendaftaran?")) return;

    setActionLoading(true);
    setInfo("");
    try {
      const res = await cancelEventRegistration(id);
      setInfo(res.message || "Pendaftaran berhasil dibatalkan");

      setRegistrations((prev) =>
        prev.filter((reg) => String(reg.bencanaId) !== String(id))
      );
    } catch (err) {
      console.error(err);
      setInfo(err.message || "Gagal membatalkan pendaftaran");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const renderRegistrationSection = () => {
    if (loadingRegistrations) {
      return (
        <p className="text-sm text-slate-500">Memuat status pendaftaran...</p>
      );
    }

    // belum login
    if (!localStorage.getItem("token")) {
      return (
        <p className="text-sm text-slate-600">
          Silakan{" "}
          <button
            className="text-blue-600 underline"
            onClick={() => navigate("/login")}
          >
            login
          </button>{" "}
          untuk mendaftar sebagai relawan.
        </p>
      );
    }

    if (!event) return null;

    const max = Number(event.maxVolunteers);
    const current = Number(event.currentVolunteers);
    const hasMax = Number.isFinite(max) && max > 0;
    const hasCurrent = Number.isFinite(current) && current >= 0;
    const isFull = hasMax && hasCurrent && current >= max;

    return (
      <div className="mt-4 space-y-2">
        {hasMax && (
          <p className="text-sm text-slate-700">
            Kuota relawan:{" "}
            <span className="font-semibold">
              {hasCurrent ? current : 0} / {max}
            </span>
          </p>
        )}

        {isRegistered ? (
          <div className="space-y-2">
            <p className="text-sm text-emerald-700">
              Kamu sudah terdaftar sebagai relawan untuk kegiatan ini.
              {registrationStatus && (
                <>
                  {" "}
                  Status:{" "}
                  <span className="font-semibold uppercase">
                    {registrationStatus}
                  </span>
                </>
              )}
            </p>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm disabled:opacity-60"
            >
              {actionLoading ? "Memproses..." : "Batalkan pendaftaran"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={actionLoading || isFull}
            className="px-4 py-2 rounded-xl bg-blue-700 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isFull
              ? "Kuota penuh"
              : actionLoading
              ? "Memproses..."
              : "Daftar sebagai relawan"}
          </button>
        )}
      </div>
    );
  };

  const renderWeatherSection = () => {
    if (loadingWeather) {
      return (
        <div className="mt-6 border rounded-2xl p-4 bg-white shadow-sm">
          <p className="text-sm text-slate-500">Memuat informasi cuaca...</p>
        </div>
      );
    }

    if (!weather) return null;

    // `weather` di state berisi langsung:
    // { city, country, temp, feelsLike, humidity, description, icon, windSpeed }
    const w = weather;

    return (
      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Perkiraan Cuaca di Lokasi Bencana
        </h3>
        <p className="text-xs text-slate-600">
          {w.city}, {w.country}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Suhu: {w.temp}°C (terasa {w.feelsLike}°C) • Kelembapan: {w.humidity}%
          • Angin: {w.windSpeed} m/s
        </p>
        <p className="mt-1 text-xs text-slate-600 capitalize">
          Kondisi: {w.description}
        </p>
      </div>
    );
  };

  if (loadingEvent) {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        {/* Tombol kembali */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
        >
          ← Kembali
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
            {event.date && <span>Tanggal: {formatDate(event.date)}</span>}
          </div>

          {/* Deskripsi */}
          {event.description && (
            <p className="mt-6 text-sm text-slate-700 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Bagian pendaftaran */}
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              Informasi Relawan
            </h3>
            {renderRegistrationSection()}
            {info && <p className="text-xs text-emerald-600 mt-2">{info}</p>}
          </div>

          {/* Bagian cuaca */}
          {renderWeatherSection()}
        </div>
      </div>
    </div>
  );
}
