import AmenitiesSelector from "../../../components/AmenitiesSelector";
import AddressAutocomplete from "../../../components/AddressAutocomplete";

export default function ApartmentEditForm({
  form,
  setForm,
  saving,
  onSubmit,
  apartmentId,
}) {
  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePlaceSelect(place) {
    setForm((prev) => ({
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
    <form onSubmit={onSubmit} className="grid grid-3">
      <label>
        Naslov
        <input
          type="text"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          required
        />
      </label>

      <label>
        Opis
        <input
          type="text"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          required
        />
      </label>

      <label style={{ gridColumn: "1 / -1" }}>
        Lokacija
        <AddressAutocomplete
          onSelect={handlePlaceSelect}
          initialValue={
            form.address ? `${form.address}, ${form.city}, ${form.country}` : ""
          }
        />
      </label>

      {form.address && (
        <label>
          Adresa
          <input type="text" value={form.address} readOnly />
        </label>
      )}

      {form.city && (
        <label>
          Grad
          <input type="text" value={form.city} readOnly />
        </label>
      )}

      {form.country && (
        <label>
          Država
          <input type="text" value={form.country} readOnly />
        </label>
      )}

      <label>
        Cijena po noći
        <input
          type="number"
          step="0.01"
          min="1"
          max="9999"
          value={form.pricePerNight}
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
          value={form.maxGuests}
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
          value={form.minNights}
          onChange={(e) => setField("minNights", e.target.value)}
          required
        />
      </label>

      <label>
        Politika otkazivanja
        <select
          value={form.cancellationPolicy}
          onChange={(e) => setField("cancellationPolicy", e.target.value)}
        >
          <option value="FLEXIBLE">FLEXIBLE</option>
          <option value="MODERATE">MODERATE</option>
          <option value="STRICT">STRICT</option>
        </select>
      </label>

      <AmenitiesSelector
        selectedIds={form.contentIds}
        onChange={(ids) => setForm((prev) => ({ ...prev, contentIds: ids }))}
        apartmentId={apartmentId}
      />

      <button type="submit" disabled={saving}>
        {saving ? "Spremanje..." : "Spremi promjene"}
      </button>
    </form>
  );
}
