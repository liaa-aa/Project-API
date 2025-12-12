// frontend/src/pages/Profile.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLocalUser,
  getLocalUserId,
  getLocalToken,
  getUserProfile,
  updateUserProfile,
  addUserCertificate,
  deleteUserCertificate,
} from "../api/userApi";

/**
 * ✅ Kompres + resize gambar jadi dataURL yang lebih kecil
 * - Default output: image/jpeg (lebih kecil daripada png)
 * - maxWidth/maxHeight: 900px
 * - quality: 0.75
 */
const compressImageToDataUrl = (file, opts = {}) =>
  new Promise((resolve, reject) => {
    const maxW = opts.maxWidth ?? 900;
    const maxH = opts.maxHeight ?? 900;
    const quality = opts.quality ?? 0.75; // 0..1
    const mime = opts.mime ?? "image/jpeg"; // jpeg cenderung kecil

    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        let { width, height } = img;

        const ratio = Math.min(maxW / width, maxH / height, 1);
        const newW = Math.round(width * ratio);
        const newH = Math.round(height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = newW;
        canvas.height = newH;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, newW, newH);

        const dataUrl = canvas.toDataURL(mime, quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error("Gagal membaca gambar"));
      img.src = reader.result;
    };

    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  // profil dasar
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // sertifikat
  const [certName, setCertName] = useState("");
  const [certProvider, setCertProvider] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [certCategory, setCertCategory] = useState("");
  const [certIssued, setCertIssued] = useState("");
  const [certExpired, setCertExpired] = useState("");
  const [certPhoto, setCertPhoto] = useState(""); // dataURL hasil kompres
  const [certError, setCertError] = useState("");
  const [certPhotoMeta, setCertPhotoMeta] = useState({
    originalName: "",
    originalSize: 0,
  });

  const resetCertificateForm = () => {
    setCertName("");
    setCertProvider("");
    setCertNumber("");
    setCertCategory("");
    setCertIssued("");
    setCertExpired("");
    setCertPhoto("");
    setCertError("");
    setCertPhotoMeta({ originalName: "", originalSize: 0 });
  };

  useEffect(() => {
    const local = getLocalUser();
    setUser(local);

    const userId = local?.id || local?._id;

    if (!userId) {
      setMessage("User ID tidak ditemukan. Silakan logout lalu login ulang.");
      return;
    }

    setLoading(true);
    setMessage("");

    (async () => {
      try {
        const data = await getUserProfile(userId);
        setUser(data);
        setName(data?.name || "");
      } catch (err) {
        setMessage(err?.message || "Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setMessage("");
  };

  const handleCancel = () => {
    setEditing(false);
    setMessage("");
    setName(user?.name || "");
    resetCertificateForm();
  };

  // ✅ Perbaikan: keluar edit + kembali ke halaman /profile (bukan history/home)
  const handleBackFromEdit = () => {
    handleCancel();
    navigate("/profile", { replace: true });
  };

  const handleSaveProfile = async () => {
    const uid = getLocalUserId();
    const token = getLocalToken();

    if (!uid) {
      setMessage("User ID tidak ditemukan. Silakan logout lalu login ulang.");
      return;
    }
    if (!token) {
      setMessage("Token tidak ditemukan. Silakan logout lalu login ulang.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const updated = await updateUserProfile(uid, { name });
      setUser(updated);
      setEditing(false);
      setMessage("Profil berhasil diupdate");
    } catch (err) {
      setMessage(err?.message || "Gagal update profil");
    } finally {
      setLoading(false);
    }
  };

  // ✅ file picker (custom) + kompres
  const handleSelectPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage("");
    setCertError("");

    if (!file.type || !file.type.startsWith("image/")) {
      setCertError("File sertifikat harus berupa gambar (jpg/png/webp, dll).");
      e.target.value = "";
      setCertPhoto("");
      return;
    }

    // (opsional) batasi ukuran file mentah supaya tidak berat sekali
    // misal 8MB sebelum kompres
    const maxRawBytes = 8 * 1024 * 1024;
    if (file.size > maxRawBytes) {
      setCertError("Ukuran file terlalu besar. Gunakan gambar < 8MB.");
      e.target.value = "";
      setCertPhoto("");
      return;
    }

    setCertPhotoMeta({ originalName: file.name, originalSize: file.size });

    try {
      // ✅ kompres ke jpeg, resize max 900x900
      const compressedDataUrl = await compressImageToDataUrl(file, {
        maxWidth: 900,
        maxHeight: 900,
        quality: 0.75,
        mime: "image/jpeg",
      });

      setCertPhoto(compressedDataUrl);
    } catch (err) {
      setCertError("Gagal memproses gambar. Coba file lain.");
      setCertPhoto("");
    }
  };

  const handleAddCertificate = async () => {
    const uid = getLocalUserId();
    const token = getLocalToken();

    if (!uid) {
      setMessage("User ID tidak ditemukan. Silakan logout lalu login ulang.");
      return;
    }
    if (!token) {
      setMessage("Token tidak ditemukan. Silakan logout lalu login ulang.");
      return;
    }

    setMessage("");
    setCertError("");

    // ✅ minimal wajib
    if (!certName.trim()) {
      setCertError("Nama sertifikat wajib diisi.");
      return;
    }
    if (!certPhoto) {
      setCertError("Foto sertifikat wajib diupload (pilih gambar).");
      return;
    }

    // validasi tanggal
    if (certIssued && certExpired) {
      const a = new Date(certIssued).getTime();
      const b = new Date(certExpired).getTime();
      if (!Number.isNaN(a) && !Number.isNaN(b) && b < a) {
        setCertError(
          "Tanggal kadaluarsa tidak boleh lebih awal dari tanggal terbit."
        );
        return;
      }
    }

    setLoading(true);
    try {
      // Filter out empty fields and validate dates
      const payload = {};
      if (certName) payload.name = certName;
      if (certProvider) payload.provider = certProvider;
      if (certNumber) payload.certificateNumber = certNumber;
      if (certCategory) payload.category = certCategory;

      // Only add dates if they are valid YYYY-MM-DD format
      if (certIssued && /^\d{4}-\d{2}-\d{2}$/.test(certIssued)) {
        payload.dateIssued = certIssued;
      }
      if (certExpired && /^\d{4}-\d{2}-\d{2}$/.test(certExpired)) {
        payload.dateExpired = certExpired;
      }

      if (certPhoto) payload.photo = certPhoto;

      console.log("Certificate payload:", payload);

      const userId = user?._id || user?.id || uid;
      const updated = await addUserCertificate(userId, payload);

      setUser(updated);
      resetCertificateForm();
      setMessage("Sertifikat berhasil ditambahkan");
    } catch (err) {
      setCertError(err?.message || "Gagal menambah sertifikat");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCert = async (certId) => {
    const uid = getLocalUserId();
    const token = getLocalToken();

    if (!uid) {
      setMessage("User ID tidak ditemukan. Silakan logout lalu login ulang.");
      return;
    }
    if (!token) {
      setMessage("Token tidak ditemukan. Silakan logout lalu login ulang.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const updated = await deleteUserCertificate(uid, certId);
      setUser(updated);
      setMessage("Sertifikat berhasil dihapus");
    } catch (err) {
      setMessage(err?.message || "Gagal menghapus sertifikat");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-slate-500 text-sm">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Profile</h1>

        {!editing ? (
          <button
            type="button"
            onClick={handleEdit}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            {/* ✅ Tombol Kembali: selalu ke /profile */}
            <button
              type="button"
              onClick={handleBackFromEdit}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 text-sm"
              disabled={loading}
            >
              Kembali
            </button>

            {/* ❌ Tombol Batal DIHAPUS */}

            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
              disabled={loading}
            >
              Simpan
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="mb-4 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
          {message}
        </div>
      )}

      {/* INFO DASAR */}
      <div className="border rounded-2xl p-4 mb-6">
        <div className="flex justify-between border-b pb-3 mb-3">
          <span className="text-xs font-medium text-slate-500">Nama</span>
          {!editing ? (
            <span className="text-sm font-semibold text-slate-800">
              {user.name || "-"}
            </span>
          ) : (
            <input
              className="border rounded-lg px-3 py-2 text-sm w-64"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
            />
          )}
        </div>

        <div className="flex justify-between">
          <span className="text-xs font-medium text-slate-500">Email</span>
          <span className="text-sm font-semibold text-slate-800">
            {user.email || "-"}
          </span>
        </div>
      </div>

      {/* SERTIFIKAT */}
      <div className="border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">Sertifikat</h2>
          <span className="text-xs text-slate-500">
            {user?.certificates?.length || 0} item
          </span>
        </div>

        {/* ✅ Form tambah sertifikat hanya saat edit */}
        {editing && (
          <div className="border rounded-2xl p-4 bg-slate-50 mb-4">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              Tambah Sertifikat
            </p>

            <p className="text-xs text-slate-600 mb-3">
              <span className="font-medium">Keterangan:</span> <br />
              - <span className="font-medium">Nama Sertifikat</span> = nama
              sertifikat (contoh: P3K). <br />
              - <span className="font-medium">Tanggal Terbit</span> = tanggal
              sertifikat dikeluarkan. <br />
              - <span className="font-medium">Tanggal Kadaluarsa</span> =
              berlaku sampai kapan (opsional). <br />
              - <span className="font-medium">Foto Sertifikat</span> wajib
              gambar. Sistem akan mengompres agar tidak error 413.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Nama sertifikat"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Provider"
                value={certProvider}
                onChange={(e) => setCertProvider(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Nomor sertifikat"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Kategori"
                value={certCategory}
                onChange={(e) => setCertCategory(e.target.value)}
              />
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Tanggal Terbit
                </label>
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  value={certIssued}
                  onChange={(e) => setCertIssued(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Tanggal Expired
                </label>
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  value={certExpired}
                  onChange={(e) => setCertExpired(e.target.value)}
                />
              </div>

              {/* ✅ CUSTOM FILE PICKER */}
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-600 mb-1">
                  Upload Foto Sertifikat (wajib)
                </label>

                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs cursor-pointer">
                    Pilih Gambar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSelectPhoto}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-slate-600">
                    {certPhoto
                      ? `File dipilih ✅ (${certPhotoMeta.originalName || "gambar"})`
                      : "Belum ada file"}
                  </span>
                </div>

                {certPhotoMeta.originalSize > 0 && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Ukuran file asli:{" "}
                    {(certPhotoMeta.originalSize / 1024 / 1024).toFixed(2)} MB{" "}
                    {" · "}Gambar akan dikompres otomatis.
                  </p>
                )}

                {certPhoto && (
                  <img
                    src={certPhoto}
                    alt="preview sertifikat"
                    className="mt-2 w-48 rounded-xl border border-slate-200"
                  />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddCertificate}
              disabled={loading}
              className="mt-3 text-xs px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
            >
              Tambahkan
            </button>

            {certError && (
              <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                {certError}
              </div>
            )}
          </div>
        )}

        {/* List Sertifikat */}
        {(!user.certificates || user.certificates.length === 0) && (
          <p className="text-xs text-slate-500">Belum ada sertifikat.</p>
        )}

        <div className="space-y-3">
          {user.certificates?.map((c) => (
            <div
              key={String(c._id || c.id)}
              className="border rounded-xl p-3 bg-white"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {c.name || "-"}
                  </p>

                  <div className="mt-1 text-xs text-slate-600 space-y-0.5">
                    {c.provider && <p>Provider: {c.provider}</p>}
                    {c.certificateNumber && <p>No: {c.certificateNumber}</p>}
                    {c.category && <p>Kategori: {c.category}</p>}
                    {c.dateIssued && <p>Terbit: {c.dateIssued}</p>}
                    {c.dateExpired && <p>Kadaluarsa: {c.dateExpired}</p>}
                  </div>
                </div>

                {editing && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCert(c._id || c.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white"
                    disabled={loading}
                  >
                    Hapus
                  </button>
                )}
              </div>

              {c.photo && (
                <div className="mt-3">
                  <img
                    src={c.photo}
                    alt="Foto sertifikat"
                    className="w-48 rounded-xl border border-slate-200"
                  />
                  {/* ❌ Link "Lihat ukuran penuh" DIHAPUS */}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
