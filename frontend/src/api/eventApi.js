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

// Helper GraphQL (untuk endpoint yang butuh / tidak butuh login)
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
//  PUBLIC EVENT (BENCANA) – GraphQL
// ===============================

// Ambil semua event — PUBLIC (GraphQL: getBencana)
export const getEvents = async () => {
  const query = `
    query GetBencana {
      getBencana {
        id
        title
        description
        location
        type
        date
        maxVolunteers
        currentVolunteers
      }
    }
  `;

  const data = await graphqlRequest(query);
  // backend mengembalikan { data: { getBencana: [...] } }
  return data?.getBencana || [];
};

// Ambil detail event — PUBLIC (GraphQL: getBencanaById)
export const getEventById = async (id) => {
  const query = `
    query GetBencanaById($id: ID!) {
      getBencanaById(id: $id) {
        id
        title
        description
        location
        type
        date
        maxVolunteers
        currentVolunteers
      }
    }
  `;

  const data = await graphqlRequest(query, { id });
  return data?.getBencanaById || null;
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
        updatedAt
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data?.myRegistrations || [];
};

// Batalkan pendaftaran relawan — login wajib
// (schema BE: cancelJoinBencana(bencanaId: ID!): RegisRelawan)
export const cancelEventRegistration = async (bencanaId) => {
  const query = `
    mutation CancelJoin($bencanaId: ID!) {
      cancelJoinBencana(bencanaId: $bencanaId) {
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
    message: "Pendaftaran berhasil dibatalkan",
    data: data?.cancelJoinBencana,
  };
};
