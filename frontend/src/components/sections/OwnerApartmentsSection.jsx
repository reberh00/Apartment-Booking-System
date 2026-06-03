import { Link } from 'react-router-dom';
import { assetUrl } from '../../api';

export default function OwnerApartmentsSection({ myApartments, statusBadgeClass }) {
  return (
    <section className="card">
      <div className="row between">
        <h2>Vlasnik: moji apartmani</h2>
        <Link to="/app/owner/apartments/new" className="badge badge-ok">Dodaj novi apartman</Link>
      </div>
      <div className="list">
        {myApartments.map((apt) => (
          <article key={apt.id} className="list-item">
            {apt.photos?.[0]?.url ? (
              <img src={assetUrl(apt.photos[0].url)} alt={apt.title} className="apartment-list-thumb" />
            ) : (
              <div className="apartment-list-thumb apartment-list-thumb-placeholder">Nema fotografije</div>
            )}
            <div className="row between">
              <h3>{apt.title}</h3>
              <span className={statusBadgeClass(apt.status)}>{apt.status}</span>
            </div>
            <p>{apt.city}, {apt.country}</p>
            <p>Rezervacije: {apt._count?.reservations || 0}</p>
            <p>
              Sadržaji:{' '}
              {(apt.contents || []).map((item) => item.content?.name).filter(Boolean).join(', ') || 'Nema odabranih sadržaja'}
            </p>
            <Link to={`/app/owner/apartments/${apt.id}`} className="badge badge-neutral">Detalji i uređivanje</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
