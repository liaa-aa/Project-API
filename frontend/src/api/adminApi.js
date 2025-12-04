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
// Ambil semua event (untuk admin)
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
        maxVolunteers
        currentVolunteers  
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data?.getBencana || [];
};



// ===================
// CRUD EVENT (GraphQL: createBencana, updateBencana, deleteBencana)
// ===================

// payload: { title, description, location, type, date, maxVolunteers }
export const createEvent = async (payload) => {
  const query = `
    mutation CreateBencana(
      $title: String!,
      $description: String!,
      $location: String!,
      $type: String!,
      $date: String!,
      $maxVolunteers: Int!
    ) {
      createBencana(
        title: $title,
        description: $description,
        location: $location,
        type: $type,
        date: $date,
        maxVolunteers: $maxVolunteers
      ) {
        id
        title
        description
        location
        type
        date
        maxVolunteers
      }
    }
  `;

  const variables = {
    title: payload.title,
    description: payload.description,
    location: payload.location,
    type: payload.type,
    date: payload.date,
    maxVolunteers: payload.maxVolunteers,
  };

  const data = await graphqlRequest(query, variables);
  return data?.createBencana;
};

export const updateEvent = async (id, payload) => {
  const query = `
    mutation UpdateBencana(
      $id: ID!,
      $title: String!,
      $description: String!,
      $location: String!,
      $type: String!,
      $date: String!,
      $maxVolunteers: Int!
    ) {
      updateBencana(
        id: $id,
        title: $title,
        description: $description,
        location: $location,
        type: $type,
        date: $date,
        maxVolunteers: $maxVolunteers
      ) {
        id
        title
        description
        location
        type
        date
        maxVolunteers
      }
    }
  `;

  const variables = {
    id,
    title: payload.title,
    description: payload.description,
    location: payload.location,
    type: payload.type,
    date: payload.date,
    maxVolunteers: payload.maxVolunteers,
  };

  const data = await graphqlRequest(query, variables);
  return data?.updateBencana;
};

export const deleteEvent = async (id) => {
  const query = `
    mutation DeleteBencana($id: ID!) {
      deleteBencana(id: $id) {
        id
      }
    }
  `;

  const data = await graphqlRequest(query, { id });
  return !!data?.deleteBencana;
};


// ===================
// CRUD USER (REST: /users, hanya admin)
// ===================

// Ambil semua user
export const adminFetchUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal memuat daftar user");
  }

  // backend mengembalikan array dokumen User MongoDB
  // [{ _id, name, email, role, ... }, ...]
  return data;
};

// Tambah user baru (role default: relawan)
export const adminCreateUser = async (payload) => {
  // payload: { name, email, password }
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal membuat user");
  }

  return data; // dokumen user yang baru dibuat
};

// Update user (bisa tanpa ganti password)
export const adminUpdateUser = async (id, payload) => {
  const body = {
    name: payload.name,
    email: payload.email,
  };

  // kalau password diisi, baru kirim ke backend
  if (payload.password) {
    body.password = payload.password;
  }

  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengupdate user");
  }

  return data; // dokumen user yang sudah diupdate
};

// Hapus user
export const adminDeleteUser = async (id) => {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal menghapus user");
  }

  return data; // { message: 'User deleted successfully' }
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
