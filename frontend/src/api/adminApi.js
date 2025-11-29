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

/**
 * Helper GraphQL untuk /graphql (butuh JWT + role admin untuk resolver tertentu).
 */
const graphqlRequest = async (query, variables = {}) => {
  const res = await fetch(`${API_BASE_URL}/graphql`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      json?.errors?.[0]?.message ||
        json?.message ||
        "Gagal memproses permintaan ke server"
    );
  }

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || "Terjadi error pada GraphQL");
  }

  return json.data;
};

// ===================
// EVENT LIST UNTUK ADMIN (GraphQL: getBencana)
// ===================
export const adminFetchEvents = async () => {
  const query = `
    query AdminGetBencana {
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
  return data?.getBencana || [];
};

// ===================
// CRUD EVENT (REST: /bencana, hanya admin)
// ===================

// payload minimal: { title, description, location, type, date }
export const createEvent = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/bencana`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal membuat event");
  }

  return data; // dokumen Bencana yang baru dibuat
};

export const updateEvent = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/bencana/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengubah event");
  }

  return data; // dokumen Bencana setelah update
};

export const deleteEvent = async (id) => {
  const res = await fetch(`${API_BASE_URL}/bencana/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal menghapus event");
  }

  return data; // boleh diabaikan di FE jika tidak perlu
};

// ===================
// DAFTAR RELAWAN PER EVENT (GraphQL + REST user) - SUDAH ADA
// ===================
export const fetchVolunteersByEvent = async (bencanaId) => {
  const query = `
    query BencanaRelawan($bencanaId: ID!) {
      bencanaRelawan(bencanaId: $bencanaId) {
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
  const registrations = data?.bencanaRelawan || [];

  if (registrations.length === 0) return [];

  const uniqueUserIds = Array.from(
    new Set(registrations.map((r) => r.userId).filter(Boolean))
  );

  const userMap = {};

  await Promise.all(
    uniqueUserIds.map(async (userId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}`);
        const user = await res.json().catch(() => null);
        if (res.ok && user) {
          userMap[userId] = user;
        }
      } catch {
        // abaikan error, nanti fallback ke "-"
      }
    })
  );

  return registrations.map((reg) => {
    const user = userMap[reg.userId] || null;
    return {
      ...reg,
      _id: reg.id,
      user,
      userName: user?.name || null,
      userEmail: user?.email || null,
    };
  });
};

// ===================
// UPDATE STATUS RELAWAN (GraphQL: updateRegistrationStatus) - SUDAH ADA
// ===================
export const updateRegistrationStatus = async (registrationId, status) => {
  const query = `
    mutation UpdateRegistrationStatus($id: ID!, $status: String!) {
      updateRegistrationStatus(id: $id, status: $status) {
        id
        userId
        bencanaId
        status
        createdAt
        updatedAt
      }
    }
  `;

  const data = await graphqlRequest(query, {
    id: registrationId,
    status,
  });

  return data?.updateRegistrationStatus || null;
};
