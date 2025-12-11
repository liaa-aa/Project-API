import { useEffect, useState } from "react";
import {
  getLocalUser,
  getUserProfile,
  updateUserProfile,
  addUserCertificate,
  deleteUserCertificate,
} from "../api/userApi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  // edit profil dasar
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // sertifikat
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState("");

  const [certForm, setCertForm] = useState({
    name: "",
    provider: "",
    certificateNumber: "",
    category: "",
    dateIssued: "",
    dateExpired: "",
    photo: "",
  });

  // ambil user dari localStorage + profil lengkap (termasuk certificates) dari BE
  useEffect(() => {
    const current = getLocalUser();
    if (current) {
      setUser(current);
      setName(current.name || "");

      const id = current.id || current._id;
      if (id) {
        (async () => {
          try {
            setLoadingCertificates(true);
            const full = await getUserProfile(id);
            setCertificates(full.certificates || []);
          } catch (err) {
            console.error("Gagal mengambil sertifikat:", err);
          } finally {
            setLoadingCertificates(false);
          }
        })();
      }
    }
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const id = user.id || user._id;
      const updated = await updateUserProfile(id, { name });

      const normalizedUser = {
        id: updated.id || updated._id || user.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      };

      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      setMessage("Profil berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEditing = () => {
    setEditing((prev) => !prev);
    setMessage("");
    setCertError("");
    // kalau keluar dari mode edit, reset form sertifikat
    if (editing) {
      setCertForm({
        name: "",
        provider: "",
        certificateNumber: "",
        category: "",
        dateIssued: "",
        dateExpired: "",
        photo: "",
      });
    }
  };

  const handleCertFormChange = (e) => {
    const { name, value } = e.target;
    setCertForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    if (!user) return;

    setCertLoading(true);
    setCertError("");
    setMessage("");

    try {
      const id = user.id || user._id;

      const payload = {
        name: certForm.name,
        provider: certForm.provider || undefined,
        certificateNumber: certForm.certificateNumber || undefined,
        category: certForm.category || undefined,
        photo: certForm.photo || undefined,
        dateIssued: certForm.dateIssued || undefined,
        dateExpired: certForm.dateExpired || undefined,
      };

      if (!payload.name) {
        throw new Error("Nama sertifikat wajib diisi");
      }

      const updatedUser = await addUserCertificate(id, payload);

      setCertificates(updatedUser.certificates || []);

      setCertForm({
        name: "",
        provider: "",
        certificateNumber: "",
        category: "",
        dateIssued: "",
        dateExpired: "",
        photo: "",
      });

      setMessage("Sertifikat berhasil ditambahkan.");
    } catch (err) {
      console.error(err);
      setCertError(err.message || "Gagal menambah sertifikat.");
    } finally {
      setCertLoading(false);
    }
  };

  const handleDeleteCertificate = async (certId) => {
    if (!user) return;
    if (!window.confirm("Yakin ingin menghapus sertifikat ini?")) return;

    try {
      const id = user.id || user._id;
      await deleteUserCertificate(id, certId);

      setCertificates((prev) =>
        prev.filter((c) => String(c._id) !== String(certId))
      );
      setMessage("Sertifikat berhasil dihapus.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Gagal menghapus sertifikat.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-slate-500">
        Memuat profil...
      </div>
    );
  }

  const roleLabel = user.role === "admin" ? "Administrator" : "Relawan";

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
                Informasi Akun & Sertifikat
              </h1>
            </div>

            <button
              onClick={handleToggleEditing}
              className="text-sm px-4 py-1.5 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition"
            >
              {editing ? "Selesai" : "Edit Profil"}
            </button>
          </div>

          {/* PESAN GLOBAL */}
          {message && (
            <div className="mb-4 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-xl">
              {message}
            </div>
          )}

          {/* INFO DASAR */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-medium text-slate-500">Nama</span>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ml-4 flex-1 max-w-[60%] rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-800">
                  {user.name}
                </span>
              )}
            </div>

            <ProfileItem label="Email" value={user.email} />
            <ProfileItem label="Peran" value={roleLabel} />
          </div>

          {/* SECTION SERTIFIKAT */}
          <div className="border-t border-slate-200 pt-5 mt-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-800">
                Sertifikat
              </h2>
              {!editing && (
                <span className="text-[10px] text-slate-500">
                  Klik &quot;Edit Profil&quot; untuk menambah / menghapus
                  sertifikat
                </span>
              )}
            </div>

            {loadingCertificates && (
              <p className="text-xs text-slate-500 mb-2">
                Memuat sertifikat...
              </p>
            )}

            {/* FORM TAMBAH SERTIFIKAT – hanya saat editing */}
            {editing && (
              <>
                {certError && (
                  <div className="mb-2 text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-xl">
                    {certError}
                  </div>
                )}

                <form
                  onSubmit={handleAddCertificate}
                  className="mb-4 p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Nama Sertifikat <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={certForm.name}
                      onChange={handleCertFormChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Contoh: Sertifikat Pelatihan Manajemen Bencana"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Penerbit / Provider
                    </label>
                    <input
                      type="text"
                      name="provider"
                      value={certForm.provider}
                      onChange={handleCertFormChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Contoh: BNPB, PMI, dll."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Nomor Sertifikat
                    </label>
                    <input
                      type="text"
                      name="certificateNumber"
                      value={certForm.certificateNumber}
                      onChange={handleCertFormChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Opsional"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Kategori
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={certForm.category}
                      onChange={handleCertFormChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Contoh: Pertolongan Pertama, Logistik, dsb."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">
                        Tanggal Terbit
                      </label>
                      <input
                        type="date"
                        name="dateIssued"
                        value={certForm.dateIssued}
                        onChange={handleCertFormChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">
                        Tanggal Berakhir
                      </label>
                      <input
                        type="date"
                        name="dateExpired"
                        value={certForm.dateExpired}
                        onChange={handleCertFormChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      URL Foto / Scan Sertifikat
                    </label>
                    <input
                      type="text"
                      name="photo"
                      value={certForm.photo}
                      onChange={handleCertFormChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Link gambar sertifikat (opsional)"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={certLoading}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition ${
                      certLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {certLoading ? "Menyimpan..." : "Tambah Sertifikat"}
                  </button>
                </form>
              </>
            )}

            {/* LIST SERTIFIKAT */}
            <div className="space-y-3">
              {certificates && certificates.length > 0 ? (
                certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs flex justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800">
                        {cert.name}
                      </p>
                      {cert.provider && (
                        <p className="text-slate-600">
                          Penerbit: {cert.provider}
                        </p>
                      )}
                      {cert.certificateNumber && (
                        <p className="text-slate-600">
                          No: {cert.certificateNumber}
                        </p>
                      )}
                      {cert.category && (
                        <p className="text-slate-600">
                          Kategori: {cert.category}
                        </p>
                      )}
                      {(cert.dateIssued || cert.dateExpired) && (
                        <p className="text-slate-500">
                          {cert.dateIssued &&
                            `Terbit: ${new Date(
                              cert.dateIssued
                            ).toLocaleDateString("id-ID")}`}
                          {cert.dateIssued && cert.dateExpired && " • "}
                          {cert.dateExpired &&
                            `Berlaku s.d: ${new Date(
                              cert.dateExpired
                            ).toLocaleDateString("id-ID")}`}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      {cert.photo && (
                        <a
                          href={cert.photo}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 underline mb-2"
                        >
                          Lihat foto
                        </a>
                      )}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCertificate(cert._id)}
                          className="text-[10px] px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  Belum ada sertifikat yang ditambahkan.
                </p>
              )}
            </div>
          </div>

          {/* TOMBOL SIMPAN PROFIL – SEKARANG DI PALING BAWAH */}
          {editing && (
            <form
              onSubmit={handleSaveProfile}
              className="mt-6 pt-4 border-t border-slate-200 flex justify-end"
            >
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan Profil"}
              </button>
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
