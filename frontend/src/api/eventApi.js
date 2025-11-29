// frontend/src/api/eventApi.js

const API_BASE_URL = "http://localhost:3333"; // sesuaikan jika port/backend beda

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : { "Content-Type": "application/json" };
};

// ===================
// BENCANA / EVENT
// ===================

// GET /bencana -> list semua event
export const getEvents = async () => {
  const res = await fetch(`${API_BASE_URL}/bencana`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengambil daftar event");
  }

  // BE mengembalikan array objek Bencana langsung
  return data;
};

// GET /bencana/:id -> detail satu event
export const getEventById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/bencana/${id}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengambil detail event");
  }

  return data;
};

// ===================
// REGISTRASI RELAWAN USER LOGIN
// ===================

// POST /bencana/:id/join -> daftar sebagai relawan
// (di BE: VolunteerRegistrationsController.join)
export const joinEvent = async (bencanaId) => {
  const res = await fetch(`${API_BASE_URL}/bencana/${bencanaId}/join`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal mendaftar sebagai relawan");
  }

  // BE mengembalikan { message, data: registration }
  return data;
};

// GET /my-registrations -> semua pendaftaran user login
// (di BE: VolunteerRegistrationsController.myRegistrations)
// ❗ Kalau di routes.ts namanya beda, sesuaikan path-nya.
export const getMyRegistrations = async () => {
  const res = await fetch(`${API_BASE_URL}/my-registrations`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengambil data pendaftaran saya");
  }

  // BE mengembalikan array registrations, tiap item sudah populate('bencana')
  return data;
};

// OPTIONAL: cancel pendaftaran (kalau di BE sudah ada endpoint-nya)
// Misal di BE punya router.post('/bencana/:id/cancel', 'regisRelawanController.cancel')
// Kalau belum ada, fungsi ini belum bisa dipakai dan tombol batal sebaiknya disembunyikan.
export const cancelEventRegistration = async (bencanaId) => {
  const res = await fetch(`${API_BASE_URL}/bencana/${bencanaId}/cancel`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal membatalkan pendaftaran");
  }

  return data;
};
