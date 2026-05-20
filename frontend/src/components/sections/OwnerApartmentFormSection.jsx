export default function OwnerApartmentFormSection({ newApartment, setNewApartment, createApartment, contentsOptions }) {
  return (
    <section className="card">
      <h2>Vlasnik: dodaj apartman</h2>
      <form onSubmit={createApartment} className="grid grid-3">
        {Object.entries(newApartment).filter(([key]) => key !== 'contentIds').map(([key, value]) => (
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

        <div>
          <strong>Sadržaji (amenities)</strong>
          <div className="list compact">
            {contentsOptions.map((content) => {
              const checked = newApartment.contentIds.includes(content.id);
              return (
                <label key={content.id} className="list-item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const nextIds = e.target.checked
                        ? [...newApartment.contentIds, content.id]
                        : newApartment.contentIds.filter((id) => id !== content.id);
                      setNewApartment((prev) => ({ ...prev, contentIds: nextIds }));
                    }}
                  />
                  {content.name}
                </label>
              );
            })}
          </div>
        </div>

        <button type="submit">Kreiraj apartman</button>
      </form>
    </section>
  );
}
