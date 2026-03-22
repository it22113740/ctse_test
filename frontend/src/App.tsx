import { useCallback, useEffect, useState } from "react";

const apiBase = "http://localhost:8080";

const fetchOpts: RequestInit = {
  cache: "no-store",
  headers: { Accept: "application/json" },
};

type Event = { id: string; title: string; date: string; venue: string };
type Booking = {
  id: string;
  eventId: string;
  attendeeName: string;
  seats: number;
  createdAt: string;
};

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    venue: "",
    attendeeName: "",
    seats: 1,
    eventId: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const errs: string[] = [];
    try {
      const er = await fetch(`${apiBase}/api/events`, fetchOpts);
      if (er.ok) {
        setEvents(await er.json());
      } else {
        errs.push(`Events: ${er.status}`);
        setEvents([]);
      }
    } catch {
      errs.push("Events: network error");
      setEvents([]);
    }
    try {
      const br = await fetch(`${apiBase}/api/bookings`, fetchOpts);
      if (br.ok) {
        setBookings(await br.json());
      } else {
        errs.push(`Bookings: ${br.status}`);
        setBookings([]);
      }
    } catch {
      errs.push("Bookings: network error");
      setBookings([]);
    }
    if (errs.length) setError(errs.join(" · "));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (events.length && !form.eventId) {
      setForm((f) => ({ ...f, eventId: events[0].id }));
    }
  }, [events, form.eventId]);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch(`${apiBase}/api/events`, {
      ...fetchOpts,
      method: "POST",
      headers: { ...fetchOpts.headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        date: form.date,
        venue: form.venue,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMessage((j as { error?: string }).error || "Could not create event");
      return;
    }
    setForm((f) => ({ ...f, title: "", date: "", venue: "" }));
    setMessage("Event created.");
    setLoading(true);
    await load();
  }

  async function addBooking(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch(`${apiBase}/api/bookings`, {
      ...fetchOpts,
      method: "POST",
      headers: { ...fetchOpts.headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: form.eventId,
        attendeeName: form.attendeeName,
        seats: form.seats,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMessage((j as { error?: string }).error || "Could not book");
      return;
    }
    setMessage("Booking confirmed.");
    setForm((f) => ({ ...f, attendeeName: "", seats: 1 }));
    setLoading(true);
    await load();
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Events &amp; Bookings</h1>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <section>
        <h2>Events</h2>
        {events.length === 0 ? (
          <p className="muted">No events yet.</p>
        ) : (
          <ul>
            {events.map((ev) => (
              <li key={ev.id}>
                <strong>{ev.title}</strong>
                <span className="muted">
                  {" "}
                  — {ev.date} @ {ev.venue}
                </span>
                <div className="muted" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  id: {ev.id}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>New event</h2>
        <form onSubmit={addEvent}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </label>
          <label>
            Venue
            <input
              value={form.venue}
              onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
              required
            />
          </label>
          <button type="submit">Create event</button>
        </form>
      </section>

      <section>
        <h2>Bookings</h2>
        {bookings.length === 0 ? (
          <p className="muted">No bookings yet.</p>
        ) : (
          <ul>
            {bookings.map((b) => (
              <li key={b.id}>
                {b.attendeeName} — {b.seats} seat(s) for event{" "}
                <code style={{ fontSize: "0.85em" }}>{b.eventId}</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>New booking</h2>
        <form onSubmit={addBooking}>
          <label>
            Event
            <select
              value={form.eventId}
              onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
              required
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Name
            <input
              value={form.attendeeName}
              onChange={(e) => setForm((f) => ({ ...f, attendeeName: e.target.value }))}
              required
            />
          </label>
          <label>
            Seats
            <input
              type="number"
              min={1}
              value={form.seats}
              onChange={(e) => setForm((f) => ({ ...f, seats: Number(e.target.value) || 1 }))}
            />
          </label>
          <button type="submit" disabled={events.length === 0}>
            Book
          </button>
        </form>
      </section>
    </>
  );
}
