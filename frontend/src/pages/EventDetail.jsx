import { useParams } from "react-router-dom";

export default function EventDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Event Detail</h1>
      <p>ID Event: {id}</p>
      <p className="mt-2 text-gray-600">
        Detail lengkap event akan dimuat dari API nanti.
      </p>
    </div>
  );
}
