import { useApartmentForm } from "../../hooks/useApartmentForm";
import AmenitiesSelector from "../../components/AmenitiesSelector";

export default function OwnerApartmentCreatePage() {
  const { newApartment, setNewApartment, createApartment } = useApartmentForm();

  return (
    <section className="card">
      <h2>Vlasnik: dodaj apartman</h2>
      <form onSubmit={createApartment} className="grid grid-3">
        {Object.entries(newApartment)
          .filter(([key]) => key !== "contentIds")
          .map(([key, value]) => (
            <label key={key}>
              {key}
              {key === "cancellationPolicy" ? (
                <select
                  value={value}
                  onChange={(e) =>
                    setNewApartment((p) => ({ ...p, [key]: e.target.value }))
                  }
                >
                  <option value="FLEXIBLE">FLEXIBLE</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="STRICT">STRICT</option>
                </select>
              ) : (
                <input
                  value={value}
                  onChange={(e) =>
                    setNewApartment((p) => ({ ...p, [key]: e.target.value }))
                  }
                  required
                />
              )}
            </label>
          ))}

        <AmenitiesSelector
          selectedIds={newApartment.contentIds}
          onChange={(ids) =>
            setNewApartment((prev) => ({ ...prev, contentIds: ids }))
          }
        />

        <button type="submit">Kreiraj apartman</button>
      </form>
    </section>
  );
}
