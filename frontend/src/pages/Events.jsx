import { Link } from "react-router-dom";

export default function Events() {
  const dummyEvents = [
    { _id: "1", title: "Bakti Sosial", location: "Bandung" },
    { _id: "2", title: "Donor Darah", location: "Jakarta" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Volunteer Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dummyEvents.map((ev) => (
          <Link
            key={ev._id}
            to={`/events/${ev._id}`}
            className="border p-4 rounded shadow"
          >
            <h2 className="font-bold text-lg">{ev.title}</h2>
            <p className="text-gray-600">{ev.location}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
