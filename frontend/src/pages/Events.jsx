// frontend/src/pages/Events.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../api/eventApi";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Gagal memuat event");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl pt-9 mx-auto mt-8 mb-9">
      <h1 className="text-2xl font-bold mb-4">Volunteer Events</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Memuat event...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-600">Belum ada event.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => {
            const max = Number(ev.maxVolunteers);
            const current = Number(ev.currentVolunteers);

            const hasMax = Number.isFinite(max) && max > 0;
            const hasCurrent = Number.isFinite(current) && current >= 0;

            const isFull = hasMax && hasCurrent && current >= max;

            const remaining = hasMax && hasCurrent ? max - current : null;

            return (
              <Link
                key={ev._id || ev.id}
                to={`/events/${ev._id || ev.id}`}
                className="border p-4 rounded shadow hover:shadow-md transition bg-white"
              >
                <h2 className="font-bold text-lg mb-1">{ev.title}</h2>
                <p className="text-gray-600">{ev.location}</p>

                <p className="text-xs text-gray-500 mt-1">
                  Jenis: {ev.type || "-"}
                </p>

                {ev.date && (
                  <p className="text-xs text-gray-500">
                    Tanggal:{" "}
                    {new Date(ev.date).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}

                {hasMax && (
                  <p className="text-xs text-gray-500">
                    Maksimal relawan:{" "}
                    <span className="font-semibold">{max}</span>
                  </p>
                )}

                {hasCurrent && (
                  <p className="text-xs text-gray-700 mt-1">
                    Pendaftar:{" "}
                    <span className="font-semibold">
                      {current}
                      {hasMax && <> / {max}</>} relawan
                    </span>
                  </p>
                )}

                {hasMax && hasCurrent && (
                  <p
                    className={`text-xs mt-1 ${
                      isFull ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isFull
                      ? "Event penuh"
                      : `Slot tersisa: ${remaining} relawan`}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
