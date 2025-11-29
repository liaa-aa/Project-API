// frontend/src/api/authApi.js

const API_BASE_URL = "http://localhost:3333"; // sesuaikan kalau beda

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Login gagal");
  }

  // expected shape dari BE:
  // { message, token, user: { id, name, email, role } }
  return data;
};

export const register = async (name, email, password) => {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Register gagal");
  }

  return data;
};

export const googleLogin = async (idToken) => {
  const res = await fetch(`${API_BASE_URL}/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Login Google gagal");
  }

  // expected shape sama: { message, token, user }
  return data;
};
