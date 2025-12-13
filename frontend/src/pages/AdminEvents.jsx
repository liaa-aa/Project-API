// frontend/src/pages/AdminEvents.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import {
  adminFetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../api/adminApi";
import CitySelect from "../components/CitySelect";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fileRef = useRef(null);

  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    location: "",
    type: "",
    date: "",
    maxVolunteers: "",
    photo: "", // base64 / url
  });

  const [isEditing, setIsEditing] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetchEvents();
      setEvents(data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat event");
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
      photo: "",
    });
    setIsEditing(false);
    setError("");
    setSuccessMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (value) => {
    setForm((prev) => ({
      ...prev,
      location: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // optional: validasi ukuran (misal max 2MB)
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("Ukuran gambar terlalu besar. Maksimal 2MB.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        photo: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setForm((prev) => ({ ...prev, photo: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.title || !form.location || !form.type || !form.date) {
      setError("Judul, lokasi, tipe, dan tanggal wajib diisi.");
      return;
    }

    const maxVol = parseInt(form.maxVolunteers, 10);
    if (!Number.isFinite(maxVol) || maxVol <= 0) {
      setError("Maksimal pendaftar harus angka lebih dari 0.");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      type: form.type,
      date: form.date,
      maxVolunteers: maxVol,
      photo: form.photo, // base64 / url
    };

    try {
      if (isEditing && form.id) {
        await updateEvent(form.id, payload);
        setSuccessMsg("Event berhasil diperbarui.");
      } else {
        await createEvent(payload);
        setSuccessMsg("Event baru berhasil dibuat.");
      }
      resetForm();
      await loadEvents();
    } catch (err) {
      setError(err.message || "Gagal menyimpan event.");
    }
  };

  const handleEditClick = (ev) => {
    const eventId = ev._id || ev.id;
    setForm({
      id: eventId,
      title: ev.title || "",
      description: ev.description || "",
      location: ev.location || "",
      type: ev.type || "",
      date: ev.date ? String(ev.date).slice(0, 10) : "",
      maxVolunteers: ev.maxVolunteers?.toString() || "",
      photo: ev.photo || "",
    });

    setIsEditing(true);
    setError("");
    setSuccessMsg("");
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Yakin ingin menghapus event ini?")) return;

    try {
      await deleteEvent(id);
      setSuccessMsg("Event berhasil dihapus.");
      await loadEvents();
    } catch (err) {
      setError(err.message || "Gagal menghapus event.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    });
  }, [events]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Manajemen Event
            </h1>
            <p className="text-sm text-slate-500">
              Kelola data bencana dan kegiatan relawan.
            </p>
          </div>
        </header>

        {/* FORM */}
        <section className="border rounded-2xl p-5 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-3">
            {isEditing ? "Edit Event" : "Buat Event Baru"}
          </h2>

          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          {successMsg && (
            <p className="text-sm text-green-600 mb-2">{successMsg}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Contoh: Banjir Banda Aceh"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="Tuliskan detail kegiatan, kebutuhan, dan informasi penting."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <CitySelect
                  label="Lokasi (Kota)"
                  value={form.location}
                  onChange={handleLocationChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipe</label>
                <input
                  type="text"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="bencana alam, sosial, dll"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="contoh: 50"
                  required
                />
              </div>
            </div>

            {/* PHOTO - tombol tambah gambar */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Photo Bencana
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                >
                  ➕ Tambah Gambar
                </button>

                <span className="text-xs text-slate-600">
                  {form.photo ? "Gambar dipilih ✅" : "Belum ada gambar"}
                </span>

                {form.photo && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                    title="Hapus gambar"
                  >
                    Hapus
                  </button>
                )}

                {/* input file hidden */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {form.photo && (
                <div className="mt-3">
                  <img
                    src={form.photo}
                    alt="Preview"
                    className="w-56 h-36 object-cover rounded-xl border border-slate-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                {isEditing ? "Simpan Perubahan" : "Buat Event"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-full border border-slate-300 text-sm hover:bg-slate-100"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* LIST */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Daftar Event</h2>

          {loading ? (
            <p className="text-sm text-slate-500">Memuat data event...</p>
          ) : sortedEvents.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada event. Tambahkan event baru di atas.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedEvents.map((ev) => {
                const eventId = ev._id || ev.id;

                return (
                  <div
                    key={eventId}
                    className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    {ev.photo && String(ev.photo).trim() !== "" && (
                      <div className="w-full h-32 overflow-hidden bg-slate-100">
                        <img
                          src={ev.photo}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="text-base font-semibold text-slate-800">
                        {ev.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {ev.location} • {formatDate(ev.date)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Tipe: <span className="font-medium">{ev.type}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Relawan:{" "}
                        <span className="font-semibold">
                          {ev.currentVolunteers || 0} / {ev.maxVolunteers || 0}
                        </span>
                      </p>

                      <p className="text-sm text-slate-700 mt-2 line-clamp-2">
                        {ev.description || "Tidak ada deskripsi."}
                      </p>

                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                        <button
                          type="button"
                          onClick={() => handleEditClick(ev)}
                          className="px-3 py-1 rounded bg-slate-200 text-xs hover:bg-slate-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(eventId)}
                          className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
