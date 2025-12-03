// frontend/src/pages/AdminEvents.jsx

import { useEffect, useState } from "react";
import {
  adminFetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../api/adminApi";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    location: "",
    type: "",
    date: "",
    maxVolunteers: "", // <--- tambahan
  });


  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isEditing = !!form.id;

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetchEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message || "Gagal memuat daftar event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const resetForm = () => {
    setForm({
      id: null,
      title: "",
      description: "",
      location: "",
      type: "",
      date: "",
      maxVolunteers: "",
    });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (event) => {
    setForm({
      id: event.id,
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      type: event.type || "",
      // tanggal dari BE biasanya ISO, ambil bagian YYYY-MM-DD untuk input type="date"
      date: event.date ? event.date.slice(0, 10) : "",
      maxVolunteers:
        typeof event.maxVolunteers === "number"
          ? String(event.maxVolunteers)
          : "",
    });
    setSuccessMsg("");
  };


  const handleDeleteClick = async (eventId) => {
    if (!window.confirm("Yakin ingin menghapus event ini?")) return;

    try {
      await deleteEvent(eventId);
      setSuccessMsg("Event berhasil dihapus");
      await loadEvents();
    } catch (err) {
      alert(err.message || "Gagal menghapus event");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const maxVol = parseInt(form.maxVolunteers, 10);
      if (!Number.isFinite(maxVol) || maxVol <= 0) {
        throw new Error("Maksimal pendaftar harus angka lebih dari 0");
      }

      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        type: form.type,
        // kirim langsung YYYY-MM-DD; Date di backend bisa parse ini
        date: form.date,
        maxVolunteers: maxVol,
      };

      if (isEditing) {
        await updateEvent(form.id, payload);
        setSuccessMsg("Event berhasil diperbarui");
      } else {
        await createEvent(payload);
        setSuccessMsg("Event baru berhasil dibuat");
      }

      resetForm();
      await loadEvents();
    } catch (err) {
      setError(err.message || "Gagal menyimpan event");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Kelola Event (Admin)</h1>

      {/* FORM CREATE / EDIT */}
      <div className="mb-6 border rounded-lg p-4 shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-3">
          {isEditing ? "Edit Event" : "Buat Event Baru"}
        </h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {successMsg && <p className="text-green-600 mb-2">{successMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Lokasi</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <input
                type="text"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="bencana alam, sosial, dll"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Maksimal Pendaftar (Relawan)
              </label>
              <input
                type="number"
                name="maxVolunteers"
                min="1"
                value={form.maxVolunteers}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="contoh: 50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Lokasi</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <input
                type="text"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="bencana alam, sosial, dll"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* Tambahan: maksimal pendaftar */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Maksimal Pendaftar (Relawan)
            </label>
            <input
              type="number"
              name="maxVolunteers"
              min="1"
              value={form.maxVolunteers}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="contoh: 50"
              required
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
            >
              {submitting
                ? "Menyimpan..."
                : isEditing
                ? "Simpan Perubahan"
                : "Buat Event"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1 rounded border text-sm"
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST EVENT */}
      <div className="border rounded-lg p-4 shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-3">Daftar Event</h2>

        {loading && <p>Memuat daftar event...</p>}

        {!loading && events.length === 0 && (
          <p>Belum ada event. Silakan buat event baru.</p>
        )}

        {!loading && events.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="border rounded-lg p-3 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-semibold mb-1">{ev.title}</h3>
                  <p className="text-xs text-gray-600 mb-1">
                    {ev.description || "-"}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Lokasi:</span>{" "}
                    {ev.location || "-"}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Tipe:</span> {ev.type || "-"}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Tanggal:</span>{" "}
                    {ev.date ? new Date(ev.date).toLocaleDateString() : "-"}
                  </p>
                  {typeof ev.maxVolunteers === "number" && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Maksimal pendaftar:</span>{" "}
                      {ev.maxVolunteers} relawan
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-1">{ev.title}</h3>
                  <p className="text-xs text-gray-600 mb-1">
                    {ev.description || "-"}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Lokasi:</span>{" "}
                    {ev.location || "-"}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Tipe:</span> {ev.type || "-"}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Tanggal:</span>{" "}
                    {ev.date ? new Date(ev.date).toLocaleDateString() : "-"}
                  </p>
                  {typeof ev.maxVolunteers === "number" && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Maksimal pendaftar:</span>{" "}
                      {ev.maxVolunteers} relawan
                    </p>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditClick(ev)}
                    className="px-3 py-1 rounded bg-yellow-500 text-white text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(ev.id)}
                    className="px-3 py-1 rounded bg-red-600 text-white text-xs"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
