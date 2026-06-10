import { Link } from 'react-router-dom';
import { assetUrl } from '../api';

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
          <Link key={apt.id} to={`/apartments/${apt.id}`} className="list-item card-link-reset">
            {apt.photos?.[0]?.url ? (
              <img src={assetUrl(apt.photos[0].url)} alt={apt.title} className="apartment-list-thumb" />
            ) : (
              <div className="apartment-list-thumb apartment-list-thumb-placeholder">Nema fotografije</div>
            )}
            <h3>{apt.title}</h3>
            <p>{apt.city}, {apt.country}</p>
            <p>Vlasnik: {apt.owner ? `${apt.owner.firstName} ${apt.owner.lastName}` : 'Nepoznato'}</p>
            <p>{apt.pricePerNight} EUR / noć • max {apt.maxGuests} gostiju</p>
            <p>ID: <code>{apt.id}</code></p>
          </Link>
        ))}
      </div>
    </section>
  );
}
