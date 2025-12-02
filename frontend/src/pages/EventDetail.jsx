// frontend/src/pages/EventDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  // Ambil pendaftaran saya untuk event ini (kalau login)
  useEffect(() => {
    const fetchMyReg = async () => {
      if (!isLoggedIn) return;
      setLoadingRegistration(true);
      setError("");
      try {
        const regs = await getMyRegistrations();
        // cari registrasi dengan bencana yang sesuai
        const found = regs.find((r) => {
          // bisa berupa ObjectId atau objek bencana yang di-populate
          const bencanaId =
            (typeof r.bencana === "string" ? r.bencana : r.bencana?._id) ||
            r.bencanaId;
          return String(bencanaId) === String(id);
        });
        setMyRegistration(found || null);
      } catch (err) {
        // kalau endpoint my-registrations belum ada / error, jangan matikan halaman
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
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
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
                  onClick={() =>
                    navigate("/login")
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 text-sm"
                >
                  Daftar sebagai relawan
                </button>
              </div>
            )}

            {isLoggedIn && (
              <div className="flex gap-2 items-center">
                {!myRegistration ? (
                  <button
                    onClick={handleJoin}
                    disabled={actionLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 text-sm"
                  >
                    {actionLoading ? "Memproses..." : "Daftar sebagai relawan"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60 text-sm"
                    >
                      {actionLoading ? "Memproses..." : "Batalkan pendaftaran"}
                    </button>
                  </>
                )}
              </div>
            )}

            {info && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 p-2 rounded">
                {info}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
