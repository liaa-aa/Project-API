// frontend/src/api/userApi.js

const API_BASE_URL = "http://localhost:3333";

// Ambil user dari localStorage
export const getLocalUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// ✅ userId bisa ada di beberapa bentuk
export const getLocalUserId = () => {
  const u = getLocalUser();
  return u?._id || u?.id || u?.user?._id || u?.user?.id || null;
};

// ✅ token juga bisa disimpan pakai key berbeda
export const getLocalToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    null
  );
};

const getAuthHeaders = () => {
  const token = getLocalToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

const readJsonSafe = async (res) => {
  const text = await res.text();
  try {
    return { json: text ? JSON.parse(text) : {}, raw: text };
  } catch {
    return { json: {}, raw: text };
  }
};

export const getUserProfile = async (userId) => {
  if (!userId) throw new Error("User ID tidak ditemukan. Silakan login ulang.");

  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const { json, raw } = await readJsonSafe(res);
  if (!res.ok) {
    throw new Error(
      json.message || `Gagal mengambil profil (HTTP ${res.status}): ${raw || "-"}`
    );
  }
  return json;
};

export const updateUserProfile = async (userId, payload) => {
  if (!userId) throw new Error("User ID tidak ditemukan. Silakan login ulang.");

  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const { json, raw } = await readJsonSafe(res);
  if (!res.ok) {
    throw new Error(
      json.message || `Gagal update profil (HTTP ${res.status}): ${raw || "-"}`
    );
  }
  return json;
};

export const addUserCertificate = async (userId, payload) => {
  if (!userId) throw new Error("User ID tidak ditemukan. Silakan login ulang.");

  const res = await fetch(`${API_BASE_URL}/users/${userId}/certificates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const { json, raw } = await readJsonSafe(res);
  if (!res.ok) {
    throw new Error(
      json.message ||
        `Gagal menambah sertifikat (HTTP ${res.status}): ${raw || "-"}`
    );
  }
  return json;
};

export const deleteUserCertificate = async (userId, certId) => {
  if (!userId) throw new Error("User ID tidak ditemukan. Silakan login ulang.");
  if (!certId) throw new Error("ID sertifikat tidak valid.");

  const res = await fetch(
    `${API_BASE_URL}/users/${userId}/certificates/${certId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const { json, raw } = await readJsonSafe(res);
  if (!res.ok) {
    throw new Error(
      json.message ||
        `Gagal menghapus sertifikat (HTTP ${res.status}): ${raw || "-"}`
    );
  }
  return json;
};
