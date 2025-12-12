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
  const [certName, setCertName] = useState("");
  const [certProvider, setCertProvider] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [certCategory, setCertCategory] = useState("");
  const [certIssued, setCertIssued] = useState("");
  const [certExpired, setCertExpired] = useState("");

  // foto sertifikat (dataURL/base64)
  const [certPhoto, setCertPhoto] = useState("");

  useEffect(() => {
    const init = async () => {
      const local = getLocalUser();
      if (!local) return;

      const userId = local.id || local._id;

      setLoading(true);
      setMessage("");

      try {
        const data = await getUserProfile(userId);
        setUser(data);
        setName(data?.name || "");
      } catch (err) {
        setMessage(err.message || "Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    setMessage("");

    try {
      const updated = await updateUserProfile(user._id || user.id, { name });
      setUser(updated);
      setEditing(false);
      setMessage("Profil berhasil diperbarui.");
    } catch (err) {
      setMessage(err.message || "Gagal update profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // convert ke base64 dataURL agar bisa disimpan di backend sebagai string
    const reader = new FileReader();
    reader.onload = () => {
      setCertPhoto(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleAddCertificate = async () => {
    if (!user) return;
    setLoading(true);
    setMessage("");

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

      console.log('Certificate payload:', payload);
      const userId = user._id || user.id;
      const updated = await addUserCertificate(userId, payload);
      setUser(updated);

      // reset form
      setCertName("");
      setCertProvider("");
      setCertNumber("");
      setCertCategory("");
      setCertIssued("");
      setCertExpired("");
      setCertPhoto("");

      setMessage("Sertifikat berhasil ditambahkan.");
    } catch (err) {
      setMessage(err.message || "Gagal menambah sertifikat");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!user) return;
    const ok = window.confirm("Hapus sertifikat ini?");
    if (!ok) return;

    setLoading(true);
    setMessage("");

    try {
      const updated = await deleteUserCertificate(user._id || user.id, certId);
      setUser(updated);
      setMessage("Sertifikat berhasil dihapus.");
    } catch (err) {
      setMessage(err.message || "Gagal menghapus sertifikat");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24">
        <h2 className="text-xl font-bold mb-2">Profil</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Memuat...</p>
        ) : (
          <p className="text-sm text-slate-500">
            Silakan login terlebih dahulu.
          </p>
        )}
        {message && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <h2 className="text-2xl font-bold mb-6">Profil Relawan</h2>

      {message && (
        <div className="mb-4 text-sm text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded">
          {message}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Informasi</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white"
              disabled={loading}
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white"
                disabled={loading}
              >
                Simpan
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setName(user?.name || "");
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700"
                disabled={loading}
              >
                Batal
              </button>
            </div>
          )}
        </div>

        <ProfileRow
          label="Nama"
          value={
            editing ? (
              <input
                className="border rounded-lg px-3 py-2 text-sm w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama"
              />
            ) : (
              user?.name || "-"
            )
          }
        />
        <ProfileRow label="Email" value={user?.email || "-"} />
        <ProfileRow label="Role" value={user?.role || "-"} />
      </div>

      {/* Certificates */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Sertifikat</h3>
          <span className="text-xs text-slate-500">
            {user?.certificates?.length || 0} item
          </span>
        </div>

        {/* Add Certificate Form */}
        <div className="border rounded-2xl p-4 bg-slate-50 mb-4">
          <p className="text-sm font-semibold text-slate-800 mb-3">
            Tambah Sertifikat
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

            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-600 mb-1">
                Upload Foto Sertifikat
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSelectPhoto}
                className="text-sm"
              />
              {certPhoto && (
                <img
                  src={certPhoto}
                  alt="preview"
                  className="mt-2 w-48 rounded-xl border border-slate-200"
                />
              )}
            </div>
          </div>

          <button
            onClick={handleAddCertificate}
            className="mt-3 text-xs px-4 py-2 rounded-lg bg-blue-600 text-white"
            disabled={loading || !certName}
          >
            Tambahkan
          </button>
        </div>

        {/* Certificate List */}
        {!user?.certificates || user.certificates.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada sertifikat.</p>
        ) : (
          <div className="space-y-3">
            {user.certificates.map((c) => (
              <div
                key={c._id || c.id}
                className="border rounded-2xl p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {c.name || "-"}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Provider: {c.provider || "-"} • No:{" "}
                    {c.certificateNumber || "-"}
                  </p>
                  <p className="text-xs text-slate-600">
                    Kategori: {c.category || "-"} • Terbit:{" "}
                    {c.dateIssued || "-"} • Exp: {c.dateExpired || "-"}
                  </p>

                  {c.photo && (
                    <img
                      src={c.photo}
                      alt="sertifikat"
                      className="mt-2 w-48 rounded-xl border border-slate-200"
                    />
                  )}
                </div>

                <button
                  onClick={() => handleDeleteCert(c._id || c.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white"
                  disabled={loading}
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}
