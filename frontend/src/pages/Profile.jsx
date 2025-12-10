// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { getLocalUser, updateUserProfile } from "../api/userApi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  // hanya edit nama, karena BE hanya punya field "name"
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const current = getLocalUser();
    if (current) {
      setUser(current);
      setName(current.name || "");
    }
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const id = user.id || user._id; // jaga-jaga kalau bentuknya beda
      const updated = await updateUserProfile(id, { name });

      // BE mengembalikan dokumen user MongoDB: { _id, name, email, role, ... }
      const normalizedUser = {
        id: updated.id || updated._id || user.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      };

      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      setMessage("Profil berhasil diperbarui!");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setMessage("Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-slate-500">
        Memuat profil...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 px-6 py-7">
          {/* HEADER */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Profil
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                Informasi Akun
              </h1>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm px-4 py-1.5 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition"
              >
                Edit Profil
              </button>
            )}
          </div>

          {/* PESAN */}
          {message && (
            <div className="mb-4 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-xl">
              {message}
            </div>
          )}

          {/* MODE LIHAT */}
          {!editing && (
            <div className="space-y-4">
              <ProfileItem label="Nama" value={user.name} />
              <ProfileItem label="Email" value={user.email} />
              <ProfileItem
                label="Peran"
                value={user.role === "admin" ? "Administrator" : "Relawan"}
              />
            </div>
          )}

          {/* MODE EDIT */}
          {editing && (
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 transition
                    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setName(user.name || "");
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 transition"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}
