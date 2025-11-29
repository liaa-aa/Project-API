// frontend/src/api/adminApi.js

const API_BASE_URL = "http://localhost:3333";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };
};

// GET /bencana -> list semua event (admin pakai ini juga)
export const adminFetchEvents = async () => {
  const res = await fetch(`${API_BASE_URL}/bencana`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Gagal mengambil data event");
  return data;
};

// GET /bencana/:id/relawan -> list relawan per event
export const fetchVolunteersByEvent = async (bencanaId) => {
  const res = await fetch(`${API_BASE_URL}/bencana/${bencanaId}/relawan`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Gagal mengambil daftar relawan");
  return data;
};

// PUT /registrations/:id/status  { status }
export const updateRegistrationStatus = async (registrationId, status) => {
  const res = await fetch(
    `${API_BASE_URL}/registrations/${registrationId}/status`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Gagal mengubah status");
  return data;
};
