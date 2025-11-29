// frontend/src/api/eventApi.js

const API_BASE_URL = "http://localhost:3333"; // sesuaikan kalau beda

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : { "Content-Type": "application/json" };
};

/**
 * Helper untuk call GraphQL ke /graphql (BUTUH JWT, karena /graphql pakai middleware.auth()).
 */
const graphqlRequest = async (query, variables = {}) => {
  const res = await fetch(`${API_BASE_URL}/graphql`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json().catch(() => ({}));

  // Error HTTP dari Adonis (misalnya unauthorized)
  if (!res.ok) {
    throw new Error(
      json?.errors?.[0]?.message ||
        json?.message ||
        "Gagal memproses permintaan ke server"
    );
  }

  // Error dari GraphQL (schema/resolver)
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || "Terjadi error pada GraphQL");
  }

  return json.data;
};

// ===================
// BENCANA / EVENT (GraphQL)
// ===================

// Query: getBencana: [Bencana!]!
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
      }
    }
  `;

  const data = await graphqlRequest(query);
  // Events.jsx pakai ev._id || ev.id -> di sini hanya ada "id", tidak masalah
  return data?.getBencana || [];
};

// Query: getBencanaById(id: ID!): Bencana
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
      }
    }
  `;

  const data = await graphqlRequest(query, { id });

  if (!data?.getBencanaById) {
    throw new Error("Event tidak ditemukan");
  }

  return data.getBencanaById;
};

// ===================
// REGISTRASI RELAWAN (GraphQL)
// ===================

// Mutation: joinBencana(bencanaId: ID!): RegisRelawan
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

  // EventDetail.jsx mengharapkan { message, data }
  return {
    message: "Berhasil mendaftar sebagai relawan",
    data: data?.joinBencana || null,
  };
};

// Query: myRegistrations: [RegisRelawan!]!
export const getMyRegistrations = async () => {
  const query = `
    query MyRegistrations {
      myRegistrations {
        id
        userId
        bencanaId
        status
        createdAt
        updatedAt
      }
    }
  `;

  const data = await graphqlRequest(query);
  // EventDetail.jsx mencari bencanaId lewat r.bencanaId -> aman
  return data?.myRegistrations || [];
};

// Mutation: cancelJoinBencana(bencanaId: ID!): RegisRelawan
export const cancelEventRegistration = async (bencanaId) => {
  const query = `
    mutation CancelJoinBencana($bencanaId: ID!) {
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
    data: data?.cancelJoinBencana || null,
  };
};
