// frontend/src/pages/Profile.jsx

import { useEffect, useState } from "react";
import { getUserProfile, getLocalUser } from "../api/userApi";
import { getMyRegistrations, getEvents } from "../api/eventApi";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [errorProfile, setErrorProfile] = useState("");
  const [errorRegs, setErrorRegs] = useState("");

  const localUser = getLocalUser();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setErrorProfile("");
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        setErrorProfile(err.message || "Gagal memuat profil");
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchRegsAndEvents = async () => {
      setLoadingRegs(true);
      setErrorRegs("");

      try {
        // Ambil riwayat pendaftaran + daftar event sekaligus
        const [regData, eventData] = await Promise.all([
          getMyRegistrations(), // GraphQL myRegistrations
          getEvents(),          // GraphQL getBencana
        ]);

        setRegistrations(regData || []);
        setEvents(eventData || []);
      } catch (err) {
        setErrorRegs(err.message || "Gagal memuat riwayat pendaftaran");
      } finally {
        setLoadingRegs(false);
      }
    };

    fetchProfile();
    fetchRegsAndEvents();
  }, []);

  // Helper: cari event berdasarkan bencanaId dan kembalikan info yang dibutuhkan
  const getEventInfo = (bencanaId) => {
    const ev = events.find((e) => e.id === bencanaId);
    if (!ev) {
      return {
        title: "(judul tidak ditemukan)",
        location: "-",
        type: "-",
      };
    }
    return {
      title: ev.title || "(tanpa judul)",
      location: ev.location || "-",
      type: ev.type || "-",
    };
  };

  // Helper: styling badge status
  const renderStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    let colorClass =
      "bg-gray-200 text-gray-800"; // default

    if (s === "pending") colorClass = "bg-yellow-100 text-yellow-800";
    if (s === "approved") colorClass = "bg-green-100 text-green-800";
    if (s === "rejected") colorClass = "bg-red-100 text-red-800";

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
      >
        {status || "-"}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>

      {/* ---------------------- PROFIL ---------------------------- */}
      <div className="mb-8 border rounded-lg p-4 shadow-sm bg-white">
        {loadingProfile && <p>Memuat profil...</p>}
        {errorProfile && <p className="text-red-600">{errorProfile}</p>}

        {!loadingProfile && !errorProfile && profile && (
          <>
            <p className="mb-2">
              <span className="font-semibold">Nama:</span>{" "}
              {profile.name || localUser?.name}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Email:</span>{" "}
              {profile.email || localUser?.email}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Role:</span>{" "}
              {profile.role || localUser?.role}
            </p>
          </>
        )}
      </div>

      {/* ---------------------- RIWAYAT PENDAFTARAN (CARD VIEW) ---------------------------- */}
      <div className="border rounded-lg p-4 shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-3">Riwayat Pendaftaran Relawan</h2>

        {loadingRegs && <p>Memuat riwayat pendaftaran...</p>}
        {errorRegs && <p className="text-red-600">{errorRegs}</p>}

        {!loadingRegs && !errorRegs && registrations.length === 0 && (
          <p>Belum ada pendaftaran event yang dilakukan.</p>
        )}

        {!loadingRegs && !errorRegs && registrations.length > 0 && (
          <div className="space-y-3">
            {registrations.map((reg) => {
              const info = getEventInfo(reg.bencanaId);

              return (
                <div
                  key={reg.id}
                  className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <h3 className="text-sm font-semibold">{info.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Lokasi:</span> {info.location}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Tipe:</span> {info.type}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Waktu pendaftaran:</span>{" "}
                      {reg.createdAt
                        ? new Date(reg.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    {renderStatusBadge(reg.status)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
