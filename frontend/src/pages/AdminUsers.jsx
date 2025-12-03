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
    id: null,
    name: "",
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!form.id;

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      email: "",
      password: "",
    });
  };

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Gagal memuat daftar user");
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

  const handleEditClick = (user) => {
    setForm({
      id: user._id || user.id,
      name: user.name || "",
      email: user.email || "",
      password: "", // password tidak ditampilkan
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;

    setSubmitting(true);
    setError("");

    try {
      await adminDeleteUser(id);
      await loadUsers();
      if (form.id === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Gagal menghapus user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!form.name || !form.email) {
        throw new Error("Name dan email wajib diisi");
      }

      if (isEditing) {
        const id = form.id;
        await adminUpdateUser(id, {
          name: form.name,
          email: form.email,
          password: form.password, // boleh kosong
        });
      } else {
        if (!form.password) {
          throw new Error("Password wajib diisi untuk user baru");
        }
        await adminCreateUser({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.message || "Gagal menyimpan data user");
    } finally {
      setSubmitting(false);
    }
  };

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
            {isEditing ? "Edit User" : "Tambah User Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder={
                  isEditing
                    ? "Kosongkan jika tidak ingin mengubah password"
                    : "Minimal isi 1 password"
                }
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
              >
                {submitting
                  ? isEditing
                    ? "Menyimpan..."
                    : "Menambah..."
                  : isEditing
                  ? "Simpan Perubahan"
                  : "Tambah User"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 rounded border text-sm"
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
    </div>
  );
}
