import { useApartmentForm } from "../../hooks/useApartmentForm";
import AmenitiesSelector from "../../components/AmenitiesSelector";
import AddressAutocomplete from "../../components/AddressAutocomplete";

export default function OwnerApartmentCreatePage() {
  const { newApartment, setNewApartment, createApartment } = useApartmentForm();

  function setField(key, value) {
    setNewApartment((prev) => ({ ...prev, [key]: value }));
  }

  function handlePlaceSelect(place) {
    setNewApartment((prev) => ({
      ...prev,
      address: place.address || prev.address,
      city: place.city || "",
      country: place.country || "",
      countryCode: place.countryCode || "",
      placeId: place.placeId || "",
      latitude: place.latitude,
      longitude: place.longitude,
    }));
  }

  return (
    <section className="card">
      <h2>Vlasnik: dodaj apartman</h2>
      <form onSubmit={createApartment} className="grid grid-3">
        <label>
          Naslov
          <input
            type="text"
            value={newApartment.title}
            onChange={(e) => setField("title", e.target.value)}
            required
          />
        </label>

        <label>
          Opis
          <input
            type="text"
            value={newApartment.description}
            onChange={(e) => setField("description", e.target.value)}
            required
          />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Lokacija
          <AddressAutocomplete onSelect={handlePlaceSelect} />
        </label>

        {newApartment.address && (
          <label>
            Adresa
            <input type="text" value={newApartment.address} readOnly />
          </label>
        )}

        {newApartment.city && (
          <label>
            Grad
            <input type="text" value={newApartment.city} readOnly />
          </label>
        )}

        {newApartment.country && (
          <label>
            Država
            <input type="text" value={newApartment.country} readOnly />
          </label>
        )}

        <label>
          Cijena po noći
          <input
            type="number"
            step="0.01"
            min="1"
            max="9999"
            value={newApartment.pricePerNight}
            onChange={(e) => setField("pricePerNight", e.target.value)}
            required
          />
        </label>

        <label>
          Max gostiju
          <input
            type="number"
            step="1"
            min="1"
            max="10"
            value={newApartment.maxGuests}
            onChange={(e) => setField("maxGuests", e.target.value)}
            required
          />
        </label>

        <label>
          Min noći
          <input
            type="number"
            step="1"
            min="1"
            max="19"
            value={newApartment.minNights}
            onChange={(e) => setField("minNights", e.target.value)}
            required
          />
        </label>

        <label>
          Politika otkazivanja
          <select
            value={newApartment.cancellationPolicy}
            onChange={(e) => setField("cancellationPolicy", e.target.value)}
          >
            <option value="FLEXIBLE">FLEXIBLE</option>
            <option value="MODERATE">MODERATE</option>
            <option value="STRICT">STRICT</option>
          </select>
        </label>

        <AmenitiesSelector
          selectedIds={newApartment.contentIds}
          onChange={(ids) =>
            setNewApartment((prev) => ({ ...prev, contentIds: ids }))
          }
          style={{ gridColumn: "1 / -1" }}
        />

        <button type="submit" style={{ gridColumn: "1 / -1" }}>
          Kreiraj apartman
        </button>
      </form>
    </section>
  );
}
