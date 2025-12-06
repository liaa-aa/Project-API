const API_BASE_URL = "http://localhost:3333";

// Ambil cuaca untuk suatu bencana berdasarkan ID bencana
export const getWeatherForEvent = async (bencanaId) => {
  const res = await fetch(`${API_BASE_URL}/weather/bencana/${bencanaId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Gagal mengambil informasi cuaca");
  }

  // backend mengembalikan { success: true, data: { ...infoCuaca } }
  return data.data || null;
};
