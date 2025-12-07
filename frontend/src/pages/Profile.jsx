// frontend/src/pages/Profile.jsx

import { useEffect, useState } from "react";
import {
  getUserProfile,
  getLocalUser,
  updateUserProfile,
} from "../api/userApi";
import { getMyRegistrations, getEvents } from "../api/eventApi";

export default function Profile() {
  // data profil & form
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // data pendaftaran relawan
  const [registrations, setRegistrations] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [errorRegs, setErrorRegs] = useState("");

  // ========================
  // LOAD DATA AWAL
  // ========================
  useEffect(() => {
    const localUser = getLocalUser();

    if (!localUser) {
      setErrorProfile("Kamu belum login. Silakan login terlebih dahulu.");
      setLoadingProfile(false);
      setLoadingRegs(false);
      return;
    }

    const fetchProfile = async () => {
      setLoadingProfile(true);
      setErrorProfile("");

      try {
        const data = await getUserProfile(localUser.id);
        setProfile(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error(err);
        setErrorProfile(err.message || "Gagal memuat profil.");
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchRegistrations = async () => {
      setLoadingRegs(true);
      setErrorRegs("");

      try {
        const [regs, events] = await Promise.all([
          getMyRegistrations(),
          getEvents(),
        ]);

        const map = {};
        events.forEach((ev) => {
          map[ev.id] = ev;
        });

        setRegistrations(regs);
        setEventsMap(map);
      } catch (err) {
        console.error(err);
        setErrorRegs(err.message || "Gagal memuat data pendaftaran.");
      } finally {
        setLoadingRegs(false);
      }
    };

    fetchProfile();
    fetchRegistrations();
  }, []);

  // ========================
  // HANDLER FORM
  // ========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    const userId = profile._id || profile.id; // jaga-jaga field-nya _id atau id
    if (!userId) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const updated = await updateUserProfile(userId, {
        name: form.name,
        email: form.email,
        // kalau nanti mau tambah field lain, tinggal tambahkan di sini
      });

      setProfile(updated);
      setSaveSuccess("Profil berhasil diperbarui.");

      // update juga user di localStorage supaya Navbar dsb ikut ke-refresh datanya
      const local = getLocalUser();
      if (local) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...local,
            name: updated.name,
            email: updated.email,
          })
        );
      }
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  // ========================
  // HELPER TAMPILAN
  // ========================
  const renderStatusBadge = (status) => {
    const base =
      "inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ";

    if (status === "approved") {
      return (
        <span className={base + "bg-green-100 text-green-700"}>Disetujui</span>
      );
    }

    if (status === "rejected") {
      return <span className={base + "bg-red-100 text-red-700"}>Ditolak</span>;
    }

    // default: pending
    return (
      <span className={base + "bg-yellow-100 text-yellow-700"}>Menunggu</span>
    );
  };

  const getEventTitle = (bencanaId) =>
    eventsMap[bencanaId]?.title || "Event tidak ditemukan";

  // ========================
  // RENDER
  // ========================
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* KIRI: FORM PROFIL */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Data Akun</h2>

          {loadingProfile ? (
            <p className="text-gray-500 text-sm">Memuat data profil...</p>
          ) : errorProfile ? (
            <p className="text-red-600 text-sm">{errorProfile}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                  required
                />
              </div>

              {profile?.role && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                    {profile.role}
                  </p>
                </div>
              )}

              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              {saveSuccess && (
                <p className="text-sm text-green-600">{saveSuccess}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          )}
        </section>

        {/* KANAN: RIWAYAT PENDAFTARAN */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Riwayat Pendaftaran Relawan
          </h2>

          {loadingRegs ? (
            <p className="text-gray-500 text-sm">Memuat data pendaftaran...</p>
          ) : errorRegs ? (
            <p className="text-red-600 text-sm">{errorRegs}</p>
          ) : registrations.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Kamu belum pernah mendaftar sebagai relawan.
            </p>
          ) : (
            <div className="space-y-4 max-h-[28rem] overflow-y-auto">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="border rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {getEventTitle(reg.bencanaId)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Daftar pada:{" "}
                      {reg.createdAt
                        ? new Date(reg.createdAt).toLocaleString("id-ID")
                        : "-"}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    {renderStatusBadge(reg.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
