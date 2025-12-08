// frontend/src/pages/EventDetail.jsx
import { useEffect, useState, useMemo } from "react";
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

  // Cari pendaftaran user untuk event ini
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

  // Ambil cuaca untuk event ini
  useEffect(() => {
    const fetchWeather = async () => {
      if (!id) return;
      setLoadingWeather(true);
      try {
        const data = await getWeatherForEvent(id);
        setWeather(data);
      } catch (err) {
        console.error("Gagal mengambil cuaca:", err);
        // tidak set error global, supaya halaman tetap bisa terbuka
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [id]);

  // Ambil semua pendaftaran milik user
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

      // update state registrations
      if (res.data) {
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

      // hapus dari registrations lokal
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
        <p className="text-sm text-gray-500">Memuat status pendaftaran...</p>
      );
    }

    if (!localStorage.getItem("token")) {
      return (
        <p className="text-sm text-gray-600">
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
          <p className="text-sm text-gray-700">
            Kuota relawan:{" "}
            <span className="font-semibold">
              {hasCurrent ? current : 0} / {max}
            </span>
          </p>
        )}

        {isRegistered ? (
          <div className="space-y-2">
            <p className="text-sm text-green-700">
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
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-60"
            >
              {actionLoading ? "Memproses..." : "Batalkan pendaftaran"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={actionLoading || isFull}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
        <div className="mt-6 border rounded-xl p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-500">Memuat informasi cuaca...</p>
        </div>
      );
    }

    if (!weather) return null;

    const { city, country, weather: w } = weather;

    return (
      <div className="mt-6 border rounded-xl p-4 bg-white shadow-sm">
        <h2 className="text-base font-semibold mb-2">
          Perkiraan Cuaca Lokasi Kegiatan
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          {city}
          {country ? `, ${country}` : ""}
        </p>

        <div className="flex items-center gap-4">
          {w?.icon && (
            <img
              src={`https://openweathermap.org/img/wn/${w.icon}@2x.png`}
              alt={w.description || "Weather icon"}
              className="w-16 h-16"
            />
          )}
          <div>
            {typeof w?.temperature !== "undefined" && (
              <p className="text-2xl font-bold">
                {Math.round(w.temperature)}°C
              </p>
            )}
            {w?.description && (
              <p className="text-sm capitalize text-gray-700">
                {w.description}
              </p>
            )}
            {typeof w?.humidity !== "undefined" && (
              <p className="text-xs text-gray-500">Kelembaban: {w.humidity}%</p>
            )}
            {typeof w?.windSpeed !== "undefined" && (
              <p className="text-xs text-gray-500">
                Kecepatan angin: {w.windSpeed} m/s
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loadingEvent) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-4">
        <p>Memuat detail event...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-4">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-gray-200 text-sm"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-4">
        <p>Event tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-slate-50 min-h-[60vh]">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        ← Kembali ke daftar
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
        <p className="text-sm text-gray-500 mb-4">
          {event.type && (
            <span className="inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mr-2">
              {event.type.toUpperCase()}
            </span>
          )}
          <span>{event.location}</span> • <span>{formatDate(event.date)}</span>
        </p>

        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          {event.description}
        </p>

        {/* Bagian pendaftaran */}
        {renderRegistrationSection()}

        {info && <p className="text-xs text-green-600 mt-2">{info}</p>}

        {/* Bagian cuaca */}
        {renderWeatherSection()}
      </div>
    </div>
  );
}
