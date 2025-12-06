// frontend/src/pages/EventDetail.jsx
import { useEffect, useState } from "react";
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
  const [loadingEvent, setLoadingEvent] = useState(false);

  const [myRegistration, setMyRegistration] = useState(null);
  const [loadingRegistration, setLoadingRegistration] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  // ==== HELPER: cek apakah event sudah penuh ====
  const isEventFull = (ev) => {
    if (!ev) return false;
    const max = Number(ev.maxVolunteers);
    const current = Number(ev.currentVolunteers);
    if (!Number.isFinite(max) || !Number.isFinite(current)) return false;
    return current >= max;
  };

  const eventFull = isEventFull(event);

  // ==== HELPER: update jumlah volunteer di state event ====
  const updateVolunteerCount = (delta) => {
    setEvent((prev) => {
      if (!prev) return prev;
      const current = Number.isFinite(Number(prev.currentVolunteers))
        ? Number(prev.currentVolunteers)
        : 0;
      let next = current + delta;
      if (next < 0) next = 0;
      return {
        ...prev,
        currentVolunteers: next,
      };
    });
  };

  // Ambil detail event
  useEffect(() => {
    const fetchEvent = async () => {
      setLoadingEvent(true);
      setError("");
      try {
        const data = await getEventById(id);
        setEvent(data);
      } catch (err) {
        setError(err.message || "Gagal memuat detail event");
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Ambil cuaca untuk bencana ini
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      setWeatherError("");
      try {
        const data = await getWeatherForEvent(id);
        setWeather(data);
      } catch (err) {
        // Jangan ganggu UI utama, cukup tampilkan pesan kecil saja
        setWeatherError(err.message || "Gagal memuat info cuaca");
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [id]);

  // Ambil pendaftaran saya untuk event ini (kalau login)
  useEffect(() => {
    const fetchMyReg = async () => {
      if (!isLoggedIn) return;
      setLoadingRegistration(true);
      setError("");
      try {
        const regs = await getMyRegistrations();
        const found = regs.find((r) => {
          const bencanaId =
            (typeof r.bencana === "string" ? r.bencana : r.bencana?._id) ||
            r.bencanaId;
          return String(bencanaId) === String(id);
        });
        setMyRegistration(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRegistration(false);
      }
    };

    fetchMyReg();
  }, [id, isLoggedIn]);

  const handleJoin = async () => {
    setError("");
    setInfo("");
    setActionLoading(true);
    try {
      const res = await joinEvent(id);
      setMyRegistration(res.data || null);
      setInfo(res.message || "Berhasil mendaftar sebagai relawan");
      updateVolunteerCount(1);
    } catch (err) {
      setError(err.message || "Gagal mendaftar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setError("");
    setInfo("");
    setActionLoading(true);
    try {
      const res = await cancelEventRegistration(id);
      setMyRegistration(null);
      setInfo(res.message || "Pendaftaran berhasil dibatalkan");
      updateVolunteerCount(-1);
    } catch (err) {
      setError(
        err.message ||
          "Gagal membatalkan pendaftaran (pastikan endpoint cancel sudah ada di backend)"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = () => {
    if (!myRegistration) return null;
    const status = myRegistration.status || "pending";
    const base =
      "inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize";
    const colorByStatus = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span className={`${base} ${colorByStatus[status] || ""}`}>
        Status: {status}
      </span>
    );
  };

  // Badge kapasitas berdasarkan jumlah volunteer
  const renderCapacityBadge = () => {
    if (!event) return null;

    const max = Number(event.maxVolunteers);
    const current = Number(event.currentVolunteers);

    if (!Number.isFinite(max) || !Number.isFinite(current)) {
      return null;
    }

    const full = current >= max;
    const base =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    const color = full
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";

    const userHasSlot =
      !!myRegistration &&
      (myRegistration.status === "approved" ||
        myRegistration.status === "pending");

    return (
      <span className={`${base} ${color}`}>
        {full
          ? userHasSlot
            ? "Event penuh (kamu sudah terdaftar)"
            : "Event penuh"
          : "Slot tersedia"}
        {!full && <span className="ml-1">({max - current} slot tersisa)</span>}
      </span>
    );
  };

  // Untuk teks di bawah, pakai versi numeric yang sudah dibersihkan
  const numericMax =
    event && Number.isFinite(Number(event?.maxVolunteers))
      ? Number(event.maxVolunteers)
      : null;
  const numericCurrent =
    event && Number.isFinite(Number(event?.currentVolunteers))
      ? Number(event.currentVolunteers)
      : null;

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white shadow p-6 rounded">
      {loadingEvent ? (
        <p className="text-gray-600">Memuat detail event...</p>
      ) : error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      ) : !event ? (
        <p className="text-gray-600">Event tidak ditemukan.</p>
      ) : (
        <>
          {/* Judul + badge kapasitas */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            {renderCapacityBadge()}
          </div>

          <p className="text-gray-700 mb-1">
            Lokasi: <span className="font-semibold">{event.location}</span>
          </p>
          <p className="text-gray-700 mb-1">
            Jenis: <span className="font-semibold">{event.type}</span>
          </p>
          {event.date && (
            <p className="text-gray-700 mb-1">
              Tanggal:{" "}
              <span className="font-semibold">
                {new Date(event.date).toLocaleString()}
              </span>
            </p>
          )}

          {numericMax !== null && (
            <p className="text-gray-700 mb-1">
              Maksimal relawan:{" "}
              <span className="font-semibold">{numericMax}</span>
            </p>
          )}

          {numericCurrent !== null && (
            <p className="text-gray-700 mb-1">
              Jumlah pendaftar:{" "}
              <span className="font-semibold">
                {numericCurrent}
                {numericMax !== null && <> / {numericMax}</>} relawan
              </span>
            </p>
          )}

          {loadingWeather ? (
            <p className="text-xs text-gray-500 mt-4">
              Memuat informasi cuaca...
            </p>
          ) : weatherError ? (
            <p className="text-xs text-red-500 mt-4">{weatherError}</p>
          ) : weather ? (
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded p-4">
              <h2 className="text-sm font-semibold text-blue-800 mb-2">
                Perkiraan cuaca di lokasi event
              </h2>
              <div className="flex items-center gap-3">
                {weather.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.description}
                    className="w-10 h-10"
                  />
                )}
                <div className="text-sm text-gray-800">
                  <p className="font-medium">
                    {weather.city}
                    {weather.country && `, ${weather.country}`}
                  </p>
                  <p>
                    {weather.temp != null && (
                      <>
                        Suhu:{" "}
                        <span className="font-semibold">
                          {Math.round(weather.temp)}°C
                        </span>{" "}
                      </>
                    )}
                    {weather.feelsLike != null && (
                      <span className="text-xs text-gray-600">
                        (terasa seperti {Math.round(weather.feelsLike)}°C)
                      </span>
                    )}
                  </p>
                  {weather.description && (
                    <p className="capitalize">Kondisi: {weather.description}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    {weather.humidity != null && (
                      <>Kelembapan: {weather.humidity}% · </>
                    )}
                    {weather.windSpeed != null && (
                      <>Angin: {weather.windSpeed} m/s</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <p className="text-gray-600 mt-3">{event.description}</p>

          {/* status & tombol aksi */}
          <div className="mt-6 space-y-2">
            {renderStatusBadge()}

            {loadingRegistration && (
              <p className="text-xs text-gray-500">Memeriksa status...</p>
            )}

            {!isLoggedIn && (
              <div className="mt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  Login untuk daftar
                </button>
              </div>
            )}

            {isLoggedIn && (
              <div className="flex gap-2 items-center mt-4">
                {!myRegistration ? (
                  <button
                    onClick={handleJoin}
                    disabled={actionLoading || eventFull}
                    className={`text-white px-4 py-2 rounded disabled:opacity-60 text-sm ${
                      eventFull
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {eventFull
                      ? "Event penuh"
                      : actionLoading
                      ? "Memproses..."
                      : "Daftar sebagai relawan"}
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60 text-sm"
                  >
                    {actionLoading ? "Memproses..." : "Batalkan pendaftaran"}
                  </button>
                )}
              </div>
            )}

            {info && <p className="text-xs text-green-600 mt-2">{info}</p>}
          </div>
        </>
      )}
    </div>
  );
}
