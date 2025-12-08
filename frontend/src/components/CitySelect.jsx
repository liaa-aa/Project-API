// frontend/src/components/CitySelect.jsx

const VALID_CITIES = [
  { value: "Banda Aceh, ID", label: "Banda Aceh" },
  { value: "Medan, ID", label: "Medan" },
  { value: "Padang, ID", label: "Padang" },
  { value: "Pekanbaru, ID", label: "Pekanbaru" },
  { value: "Jambi, ID", label: "Jambi" },
  { value: "Palembang, ID", label: "Palembang" },
  { value: "Bengkulu, ID", label: "Bengkulu" },
  { value: "Bandar Lampung, ID", label: "Bandar Lampung" },

  { value: "Jakarta, ID", label: "Jakarta" },
  { value: "Bogor, ID", label: "Bogor" },
  { value: "Depok, ID", label: "Depok" },
  { value: "Bekasi, ID", label: "Bekasi" },
  { value: "Bandung, ID", label: "Bandung" },

  { value: "Semarang, ID", label: "Semarang" },
  { value: "Yogyakarta, ID", label: "Yogyakarta" },
  { value: "Surakarta, ID", label: "Surakarta" },
  { value: "Surabaya, ID", label: "Surabaya" },
  { value: "Malang, ID", label: "Malang" },

  { value: "Denpasar, ID", label: "Denpasar" },
  { value: "Mataram, ID", label: "Mataram" },
  { value: "Kupang, ID", label: "Kupang" },

  { value: "Pontianak, ID", label: "Pontianak" },
  { value: "Banjarmasin, ID", label: "Banjarmasin" },
  { value: "Samarinda, ID", label: "Samarinda" },
  { value: "Balikpapan, ID", label: "Balikpapan" },

  { value: "Manado, ID", label: "Manado" },
  { value: "Gorontalo, ID", label: "Gorontalo" },
  { value: "Palu, ID", label: "Palu" },

  { value: "Makassar, ID", label: "Makassar" },
  { value: "Kendari, ID", label: "Kendari" },

  { value: "Ambon, ID", label: "Ambon" },
  { value: "Ternate, ID", label: "Ternate" },
  { value: "Jayapura, ID", label: "Jayapura" },
];

/**
 * Select kota yang sudah dipastikan cocok dengan OpenWeather / API cuaca.
 * Value yang dikirim ke parent: string "Kota, ID"
 */
export default function CitySelect({
  label = "Lokasi (Kota)",
  value,
  onChange,
  required = true,
}) {
  const handleChange = (e) => {
    const val = e.target.value;
    onChange && onChange(val || "");
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value || ""}
        onChange={handleChange}
        className="w-full border rounded px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      >
        <option value="">Pilih kota...</option>
        {VALID_CITIES.map((city) => (
          <option key={city.value} value={city.value}>
            {city.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500">
        Kota menggunakan format{" "}
        <span className="font-semibold">"Nama Kota, ID"</span> agar cocok dengan
        API cuaca.
      </p>
    </div>
  );
}

export { VALID_CITIES };
