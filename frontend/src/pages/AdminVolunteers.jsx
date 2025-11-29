// frontend/src/pages/AdminVolunteers.jsx
import { useEffect, useState } from "react";
import {
  adminFetchEvents,
  fetchVolunteersByEvent,
  updateRegistrationStatus,
} from "../api/adminApi";

export default function AdminVolunteers() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      setError("");
      try {
        const data = await adminFetchEvents();
        setEvents(data);
        if (data.length > 0) {
          setSelectedEventId(data[0]._id || data[0].id);
        }
      } catch (err) {
        setError(err.message || "Gagal mengambil event");
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const loadVolunteers = async () => {
      if (!selectedEventId) return;
      setLoadingVolunteers(true);
      setError("");
      try {
        const data = await fetchVolunteersByEvent(selectedEventId);
        setVolunteers(data);
      } catch (err) {
        setError(err.message || "Gagal mengambil daftar relawan");
      } finally {
        setLoadingVolunteers(false);
      }
    };

    loadVolunteers();
  }, [selectedEventId]);

  const handleChangeStatus = async (registrationId, newStatus) => {
    try {
      await updateRegistrationStatus(registrationId, newStatus);
      setVolunteers((prev) =>
        prev.map((v) =>
          v._id === registrationId || v.id === registrationId
            ? { ...v, status: newStatus }
            : v
        )
      );
    } catch (err) {
      alert(err.message || "Gagal mengubah status");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white shadow p-6 rounded">
      <h2 className="text-2xl font-bold mb-4">Manage Volunteers</h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}

      {/* pilih event */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm">Event:</span>
        {loadingEvents ? (
          <span className="text-sm text-gray-500">Memuat event...</span>
        ) : (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((ev) => (
              <option key={ev._id || ev.id} value={ev._id || ev.id}>
                {ev.title} – {ev.location}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* tabel relawan */}
      {loadingVolunteers ? (
        <p className="text-sm text-gray-500">Memuat daftar relawan...</p>
      ) : volunteers.length === 0 ? (
        <p className="text-sm text-gray-500">
          Belum ada relawan yang mendaftar untuk event ini.
        </p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Nama</th>
              <th className="border px-2 py-1 text-left">Email</th>
              <th className="border px-2 py-1 text-left">Status</th>
              <th className="border px-2 py-1 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((v) => (
              <tr key={v._id || v.id}>
                <td className="border px-2 py-1">
                  {v.user?.name || v.userName || "-"}
                </td>
                <td className="border px-2 py-1">
                  {v.user?.email || v.userEmail || "-"}
                </td>
                <td className="border px-2 py-1 capitalize">{v.status}</td>
                <td className="border px-2 py-1">
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={v.status}
                    onChange={(e) =>
                      handleChangeStatus(v._id || v.id, e.target.value)
                    }
                  >
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
