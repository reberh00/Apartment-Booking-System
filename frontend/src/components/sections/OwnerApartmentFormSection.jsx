export default function OwnerApartmentFormSection({ newApartment, setNewApartment, createApartment }) {
  return (
    <section className="card">
      <h2>Vlasnik: dodaj apartman</h2>
      <form onSubmit={createApartment} className="grid grid-3">
        {Object.entries(newApartment).map(([key, value]) => (
          <label key={key}>
            {key}
            {key === 'cancellationPolicy' ? (
              <select value={value} onChange={(e) => setNewApartment((p) => ({ ...p, [key]: e.target.value }))}>
                <option value="FLEXIBLE">FLEXIBLE</option>
                <option value="MODERATE">MODERATE</option>
                <option value="STRICT">STRICT</option>
              </select>
            ) : (
              <input
                value={value}
                onChange={(e) => setNewApartment((p) => ({ ...p, [key]: e.target.value }))}
                required
              />
            )}
          </label>
        ))}
        <button type="submit">Kreiraj apartman</button>
      </form>
    </section>
  );
}
