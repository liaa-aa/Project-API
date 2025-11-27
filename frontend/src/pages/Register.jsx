export default function Register() {
  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 rounded">
      <h2 className="text-xl font-bold mb-4">Register</h2>

      <form className="flex flex-col gap-4">
        <input className="border p-2 rounded" placeholder="Name" />
        <input className="border p-2 rounded" placeholder="Email" />
        <input
          className="border p-2 rounded"
          placeholder="Password"
          type="password"
        />
        <button className="bg-green-600 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
