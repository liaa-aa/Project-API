// frontend/src/pages/AdminUsers.jsx

import { useEffect, useState } from "react";
import {
  adminFetchUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
} from "../api/adminApi";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "relawan",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // ✅ state untuk modal detail relawan (tanpa halaman baru)
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailUser, setDetailUser] = useState(null);

  const loadUsers = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await adminFetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Gagal memuat user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "relawan",
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEditClick = (user) => {
    setIsEditing(true);
    setEditId(user._id || user.id);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "relawan",
    });
  };

  const handleDeleteClick = async (id) => {
    const ok = window.confirm("Yakin ingin menghapus user ini?");
    if (!ok) return;

    try {
      setError("");
      await adminDeleteUser(id);
      await loadUsers();
      // kalau user yang sedang dibuka detail dihapus
      if (detailUser && (detailUser._id || detailUser.id) === id) {
        setDetailOpen(false);
        setDetailUser(null);
      }
    } catch (e) {
      setError(e.message || "Gagal menghapus user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!form.name || !form.email) {
        throw new Error("Name dan email wajib diisi");
      }

      if (!isEditing && !form.password) {
        throw new Error("Password wajib diisi untuk user baru");
      }

      if (isEditing) {
        await adminUpdateUser(editId, {
          name: form.name,
          email: form.email,
          role: form.role,
        });
      } else {
        await adminCreateUser({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }

      resetForm();
      await loadUsers();
    } catch (e2) {
      setError(e2.message || "Gagal menyimpan user");
    }
  };

  // ✅ buka detail relawan tanpa halaman baru
  const handleOpenDetail = async (user) => {
    const id = user._id || user.id;
    if (!id) return;

    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setDetailUser(null);

    try {
      const data = await adminFetchUserById(id);
      setDetailUser(data);
    } catch (e) {
      setDetailError(e.message || "Gagal memuat detail relawan");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailError("");
    setDetailUser(null);
    setDetailLoading(false);
  };

  const roleLabel = (role) => (role === "admin" ? "Administrator" : "Relawan");

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <h1 className="text-2xl font-bold mb-4">Admin – Manajemen User</h1>
      <p className="text-sm text-gray-600 mb-6">
        Halaman ini hanya dapat diakses oleh admin. Admin bisa menambah,
        mengedit, dan menghapus user. User yang dibuat lewat sini akan memiliki
        role default <span className="font-mono">"relawan"</span>.
      </p>

      {error && (
        <div className="mb-4 rounded bg-red-100 text-red-700 px-4 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">
            {isEditing ? "Edit User" : "Tambah User"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nama
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Nama user"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Email user"
              />
            </div>

            {!isEditing && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Password"
                />
              </div>
            )}

            {isEditing && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="relawan">relawan</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
              >
                {isEditing ? "Simpan" : "Tambah"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 text-sm"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List user */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Daftar User</h2>

          {loading ? (
            <p className="text-sm text-gray-500">Memuat user...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada user yang terdaftar.
            </p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {users.map((u) => {
                const id = u._id || u.id;
                const isRelawan = (u.role || "relawan") === "relawan";

                return (
                  <div
                    key={id}
                    className="border rounded px-3 py-2 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {u.name || "(Tanpa nama)"}
                      </p>
                      <p className="text-xs text-gray-600">{u.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Role:{" "}
                        <span className="font-mono">{u.role || "relawan"}</span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      {/* ✅ Detail relawan di halaman yang sama */}
                      {isRelawan && (
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(u)}
                          className="px-3 py-1 rounded bg-slate-800 text-white text-xs"
                        >
                          Detail
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEditClick(u)}
                        className="px-3 py-1 rounded bg-yellow-500 text-white text-xs"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(id)}
                        className="px-3 py-1 rounded bg-red-600 text-white text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ✅ MODAL DETAIL RELAWAN (TANPA HALAMAN BARU) */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-slate-100">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Detail Relawan
                </p>
                <p className="text-xs text-slate-500">
                  Data ini diambil dari endpoint <span className="font-mono">/users/:id</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs"
              >
                Tutup
              </button>
            </div>

            <div className="px-5 py-4 max-h-[75vh] overflow-y-auto">
              {detailLoading ? (
                <p className="text-sm text-slate-500">Memuat detail...</p>
              ) : detailError ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                  {detailError}
                </div>
              ) : !detailUser ? (
                <p className="text-sm text-slate-500">Tidak ada data.</p>
              ) : (
                <>
                  {/* INFO DASAR (mirip Profile.jsx) */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-xs font-medium text-slate-500">
                        Nama
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {detailUser.name || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <span className="text-xs font-medium text-slate-500">
                        Email
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {detailUser.email || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <span className="text-xs font-medium text-slate-500">
                        Peran
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {roleLabel(detailUser.role)}
                      </span>
                    </div>
                  </div>

                  {/* SERTIFIKAT (mirip section Profile.jsx) */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Sertifikat
                      </h3>
                      <span className="text-xs text-slate-500">
                        {detailUser.certificates?.length || 0} sertifikat
                      </span>
                    </div>

                    {(!detailUser.certificates ||
                      detailUser.certificates.length === 0) && (
                      <p className="text-xs text-slate-500">
                        Relawan ini belum memiliki sertifikat.
                      </p>
                    )}

                    <div className="space-y-3">
                      {detailUser.certificates?.map((c) => {
                        const cid = c._id || c.id;
                        return (
                          <div
                            key={cid}
                            className="border rounded-xl p-3 bg-slate-50"
                          >
                            <p className="text-sm font-semibold text-slate-800">
                              {c.name || "-"}
                            </p>

                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                              {c.provider && (
                                <p>
                                  <span className="font-medium">Provider:</span>{" "}
                                  {c.provider}
                                </p>
                              )}
                              {c.certificateNumber && (
                                <p>
                                  <span className="font-medium">No:</span>{" "}
                                  {c.certificateNumber}
                                </p>
                              )}
                              {c.category && (
                                <p>
                                  <span className="font-medium">Kategori:</span>{" "}
                                  {c.category}
                                </p>
                              )}
                              {c.dateIssued && (
                                <p>
                                  <span className="font-medium">Terbit:</span>{" "}
                                  {c.dateIssued}
                                </p>
                              )}
                              {c.dateExpired && (
                                <p>
                                  <span className="font-medium">Kadaluarsa:</span>{" "}
                                  {c.dateExpired}
                                </p>
                              )}
                            </div>

                            {/* FOTO SERTIFIKAT (base64 dataURL atau URL) */}
                            {c.photo && (
                              <div className="mt-3">
                                <img
                                  src={c.photo}
                                  alt="Foto sertifikat"
                                  className="w-48 rounded-xl border border-slate-200"
                                />
                                <a
                                  href={c.photo}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block text-[11px] text-blue-600 underline mt-1"
                                >
                                  Lihat ukuran penuh
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
