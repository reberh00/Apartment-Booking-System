export default function PublicSearchSection({ search, setSearch, loadApartments, apartmentsResult }) {
  return (
    <section className="card">
      <h2>Javno pretraživanje apartmana</h2>
      <div className="grid grid-6">
        {Object.entries(search).map(([key, value]) => (
          <label key={key}>
            {key}
            <input
              value={value}
              onChange={(e) => setSearch((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder={key}
            />
          </label>
        ))}
      </div>
      <button onClick={loadApartments}>Pretraži</button>
      <p className="meta">Rezultata: {apartmentsResult.total}</p>
      <div className="list">
        {apartmentsResult.apartments.map((apt) => (
          <article key={apt.id} className="list-item">
            <h3>{apt.title}</h3>
            <p>{apt.city}, {apt.country}</p>
            <p>Vlasnik: {apt.owner ? `${apt.owner.firstName} ${apt.owner.lastName}` : 'Nepoznato'}</p>
            <p>{apt.pricePerNight} EUR / noć • max {apt.maxGuests} gostiju</p>
            <p>ID: <code>{apt.id}</code></p>
          </article>
        ))}
      </div>
    </section>
  );
}
