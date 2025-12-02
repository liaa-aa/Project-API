// ===============================
//  API CONFIG
// ===============================

const API_BASE_URL = "http://localhost:3333";

// Header dengan token untuk endpoint yang membutuhkan Auth
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : { "Content-Type": "application/json" };
};

// Helper GraphQL (untuk endpoint yang butuh login)
const graphqlRequest = async (query, variables = {}) => {
  const res = await fetch(`${API_BASE_URL}/graphql`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || "Error pada GraphQL");
  }

  return json.data;
};

// ===============================
//  PUBLIC EVENT ENDPOINTS (REST)
// ===============================

// Ambil semua event — PUBLIC
export const getEvents = async () => {
  const res = await fetch(`${API_BASE_URL}/bencana`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Gagal mengambil data event");

  return await res.json();
};

// Ambil detail event — PUBLIC
export const getEventById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/bencana/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Gagal mengambil detail event");

  return await res.json();
};

// ===============================
//  RELAWAN REGISTRATION (PROTECTED)
// ===============================

// Daftar sebagai relawan — login wajib
export const joinEvent = async (bencanaId) => {
  const query = `
    mutation JoinBencana($bencanaId: ID!) {
      joinBencana(bencanaId: $bencanaId) {
        id
        userId
        bencanaId
        status
        createdAt
        updatedAt
      }
    }
  `;

  const data = await graphqlRequest(query, { bencanaId });

  return {
    message: "Berhasil mendaftar sebagai relawan",
    data: data?.joinBencana,
  };
};

// Ambil daftar event yang user sudah daftar — login wajib
export const getMyRegistrations = async () => {
  const query = `
    query {
      myRegistrations {
        id
        bencanaId
        status
        createdAt
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data?.myRegistrations || [];
};

// Batalkan pendaftaran relawan — login wajib
export const cancelEventRegistration = async (registrationId) => {
  const query = `
    mutation CancelRegistration($registrationId: ID!) {
      cancelRegistration(registrationId: $registrationId) {
        id
        userId
        bencanaId
        status
        updatedAt
      }
    }
  `;

  const data = await graphqlRequest(query, { registrationId });

  return {
    message: "Pendaftaran berhasil dibatalkan",
    data: data?.cancelRegistration,
  };
};
