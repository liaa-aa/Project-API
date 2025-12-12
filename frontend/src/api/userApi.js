// frontend/src/api/userApi.js

const API_BASE_URL = "http://localhost:3333"; // sesuaikan kalau beda

// Helper ambil user yang lagi login dari localStorage
export const getLocalUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw); // { id, name, email, role }
  } catch {
    return null;
  }
};

// Header dengan token untuk endpoint yang butuh auth
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };
};

// Ambil profil user berdasarkan ID
export const getUserProfile = async (userId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Gagal mengambil profil");
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Gagal mengambil profil");
  }
};

// Update profil user (contoh: name)
export const updateUserProfile = async (userId, payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Gagal update profil");
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Gagal update profil");
  }
};

// Tambah sertifikat user
export const addUserCertificate = async (userId, payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/certificates`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Gagal menambah sertifikat");
    }

    return data; // user ter-update
  } catch (err) {
    throw new Error(err.message || "Gagal menambah sertifikat");
  }
};

// Hapus sertifikat user
export const deleteUserCertificate = async (userId, certId) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/users/${userId}/certificates/${certId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Gagal menghapus sertifikat");
    }

    return data; // user ter-update
  } catch (err) {
    throw new Error(err.message || "Gagal menghapus sertifikat");
  }
};

// NOTE: Di ZIP ada komentar implementasi update sertifikat,
// tapi fitur update belum dipakai di FE.
