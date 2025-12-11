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

// Header dengan token untuk endpoint yang butuh Auth
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : { "Content-Type": "application/json" };
};

// Ambil profil user lengkap (GET /users/:id)
export const getUserProfile = async (id) => {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // GET sebenarnya tidak wajib auth, tapi kalau ada token sekalian kirim saja
      ...getAuthHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengambil data profil user");
  }

  // BE mengembalikan dokumen User secara langsung (dari Mongo):
  // { _id, name, email, role, certificates, ... }
  return data;
};

// Update profil user (PUT /users/:id)
// payload bisa berisi { name, email } (dan field lain jika nanti perlu)
export const updateUserProfile = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengupdate profil user");
  }

  // BE balas user yang sudah di-update
  return data;
};

/* =========================
 *  API SERTIFIKAT USER
 * ======================= */

// Tambah sertifikat (POST /users/:id/certificates)
export const addUserCertificate = async (userId, payload) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/certificates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal menambah sertifikat");
  }

  // BE mengembalikan user yang sudah di-update (dengan certificates terbaru)
  return data;
};

// Hapus sertifikat (DELETE /users/:id/certificates/:certId)
export const deleteUserCertificate = async (userId, certId) => {
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

  // BE hanya balas { message: ... }, jadi kita return apa adanya
  return data;
};

// (opsional kalau nanti mau edit sertifikat)
// export const updateUserCertificate = async (userId, certId, payload) => {
//   const res = await fetch(
//     `${API_BASE_URL}/users/${userId}/certificates/${certId}`,
//     {
//       method: "PUT",
//       headers: getAuthHeaders(),
//       body: JSON.stringify(payload),
//     }
//   );

//   const data = await res.json().catch(() => ({}));

//   if (!res.ok) {
//     throw new Error(data.message || "Gagal mengupdate sertifikat");
//   }

//   return data; // user ter-update
// };
