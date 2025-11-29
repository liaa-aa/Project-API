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

/**
 * Ambil profil user dari backend.
 * Menggunakan endpoint REST: GET /users/:id
 * (sesuai routes & usersController.show di backend)
 */
export const getUserProfile = async () => {
  const localUser = getLocalUser();
  if (!localUser || !localUser.id) {
    throw new Error("Belum login atau data user lokal tidak valid");
  }

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/users/${localUser.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Sebenarnya endpoint ini public di BE, tapi kita sertakan token kalau sewaktu-waktu dibuat protected
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengambil data profil user");
  }

  // BE mengembalikan dokumen User secara langsung (dari Mongo):
  // { _id, name, email, role, ... }
  return data;
};
