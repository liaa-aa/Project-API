// frontend/src/pages/AdminVolunteers.jsx
import { useEffect, useMemo, useState } from "react";
import {
  adminFetchEvents,
  fetchVolunteersByEvent,
  fetchVolunteerStatusCountsByEvent,
  updateRegistrationStatus,
} from "../api/adminApi";

function Badge({ children, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
        toneMap[tone] || toneMap.slate
      }`}
    >
      {children}
    </span>
  );
}

function statusBadge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return <Badge tone="yellow">Pending</Badge>;
  if (s === "approved") return <Badge tone="green">Approved</Badge>;
  if (s === "rejected") return <Badge tone="red">Rejected</Badge>;
  return <Badge tone="slate">{status || "-"}</Badge>;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminVolunteers() {
  const [events, setEvents] = useState([]);
  const [openEventId, setOpenEventId] = useState(null);

  // list lengkap relawan (dengan user) per event, hanya saat dibuka
  const [volunteersByEvent, setVolunteersByEvent] = useState({});

  // ✅ counts status per event (ditampilkan langsung tanpa klik)
  const [countsByEvent, setCountsByEvent] = useState({});

  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingByEvent, setLoadingByEvent] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      setError("");
      try {
        const data = await adminFetchEvents();
        setEvents(data || []);
      } catch (err) {
        setError(err?.message || "Gagal mengambil event");
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  // ✅ preload counts untuk semua event setelah events ter-load
  useEffect(() => {
    if (!events || events.length === 0) return;

    const preloadCounts = async () => {
      setLoadingCounts(true);
      try {
        const pairs = await Promise.all(
          events.map(async (ev) => {
            const eventId = ev._id || ev.id;
            try {
              const counts = await fetchVolunteerStatusCountsByEvent(eventId);
              return [eventId, counts];
            } catch {
              return [eventId, { pending: 0, approved: 0, rejected: 0 }];
            }
          })
        );

        const map = {};
        pairs.forEach(([eventId, counts]) => {
          map[eventId] = counts;
        });

        setCountsByEvent(map);
      } finally {
        setLoadingCounts(false);
      }
    };

    preloadCounts();
  }, [events]);

  const ensureVolunteersLoaded = async (eventId) => {
    if (!eventId) return;
    if (volunteersByEvent[eventId]) return;

    setLoadingByEvent((p) => ({ ...p, [eventId]: true }));
    setError("");

    try {
      const regs = await fetchVolunteersByEvent(eventId);
      setVolunteersByEvent((p) => ({ ...p, [eventId]: regs || [] }));
    } catch (err) {
      setError(err?.message || "Gagal mengambil daftar relawan");
    } finally {
      setLoadingByEvent((p) => ({ ...p, [eventId]: false }));
    }
  };

  const toggleOpen = async (eventId) => {
    if (openEventId === eventId) {
      setOpenEventId(null);
      return;
    }
    setOpenEventId(eventId);
    await ensureVolunteersLoaded(eventId);
  };

  const handleChangeStatus = async (eventId, registrationId, newStatus) => {
    try {
      await updateRegistrationStatus(registrationId, newStatus);

      // update list relawan (jika sudah terbuka)
      setVolunteersByEvent((prev) => {
        const list = prev[eventId] || [];
        return {
          ...prev,
          [eventId]: list.map((v) =>
            (v._id || v.id) === registrationId ? { ...v, status: newStatus } : v
          ),
        };
      });

      // ✅ update counts agar badge langsung berubah
      setCountsByEvent((prev) => {
        const c = prev[eventId] || { pending: 0, approved: 0, rejected: 0 };

        // cari status lama dari list yang ada (kalau ada)
        const list = volunteersByEvent[eventId] || [];
        const current = list.find((v) => (v._id || v.id) === registrationId);
        const old = String(current?.status || "").toLowerCase();

        const next = { ...c };
        if (old === "pending") next.pending = Math.max(0, next.pending - 1);
        if (old === "approved") next.approved = Math.max(0, next.approved - 1);
        if (old === "rejected") next.rejected = Math.max(0, next.rejected - 1);

        const ns = String(newStatus).toLowerCase();
        if (ns === "pending") next.pending += 1;
        if (ns === "approved") next.approved += 1;
        if (ns === "rejected") next.rejected += 1;

        return { ...prev, [eventId]: next };
      });
    } catch (err) {
      alert(err?.message || "Gagal mengubah status");
    }
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    });
  }, [events]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-800">Data Relawan</h1>
        <p className="text-sm text-slate-500">
          Semua event ditampilkan sebagai kartu. Jumlah status tampil otomatis,
          klik <span className="font-semibold">Lihat</span> untuk melihat siapa
          yang mendaftar.
        </p>
      </header>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {loadingEvents ? (
        <p className="text-sm text-slate-500">Memuat event...</p>
      ) : sortedEvents.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada event.</p>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedEvents.map((ev) => {
            const eventId = ev._id || ev.id;
            const isOpen = openEventId === eventId;

            const counts =
              countsByEvent[eventId] || { pending: 0, approved: 0, rejected: 0 };

            const list = volunteersByEvent[eventId] || null;

            return (
              <div
                key={eventId}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* header kartu */}
                <button
                  type="button"
                  onClick={() => toggleOpen(eventId)}
                  className="w-full text-left p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {ev.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {ev.location} • {formatDate(ev.date)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Tipe: <span className="font-medium">{ev.type}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge tone="blue">
                        {ev.currentVolunteers || 0} / {ev.maxVolunteers || 0}
                      </Badge>

                      <span className="text-[11px] text-slate-400">
                        {isOpen ? "Tutup" : "Lihat"}
                      </span>
                    </div>
                  </div>

                  {/* ✅ counts selalu tampil */}
                  <div className="flex gap-2 mt-3">
                    <Badge tone="yellow">
                      Pending: {loadingCounts ? "…" : counts.pending}
                    </Badge>
                    <Badge tone="green">
                      Approved: {loadingCounts ? "…" : counts.approved}
                    </Badge>
                    <Badge tone="red">
                      Rejected: {loadingCounts ? "…" : counts.rejected}
                    </Badge>
                  </div>
                </button>

                {/* detail relawan saat event dibuka */}
                {isOpen && (
                  <div className="border-t border-slate-100 p-4">
                    {loadingByEvent[eventId] ? (
                      <p className="text-sm text-slate-500">
                        Memuat daftar relawan...
                      </p>
                    ) : !list || list.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Belum ada relawan yang mendaftar di event ini.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {list.map((v) => {
                          const regId = v._id || v.id;
                          const name = v.user?.name || v.userName || "-";
                          const email = v.user?.email || v.userEmail || "-";
                          const st = String(v.status || "").toLowerCase();

                          const canApprove = st !== "approved";
                          const canReject = st !== "rejected";

                          return (
                            <div
                              key={regId}
                              className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate">
                                    {name}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    {email}
                                  </p>

                                  <div className="mt-2">
                                    {statusBadge(v.status)}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 items-end">
                                  <button
                                    type="button"
                                    disabled={!canApprove}
                                    onClick={() =>
                                      handleChangeStatus(eventId, regId, "approved")
                                    }
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Terima
                                  </button>

                                  <button
                                    type="button"
                                    disabled={!canReject}
                                    onClick={() =>
                                      handleChangeStatus(eventId, regId, "rejected")
                                    }
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Tolak
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
