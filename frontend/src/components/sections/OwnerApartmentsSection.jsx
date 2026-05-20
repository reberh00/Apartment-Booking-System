import { Link } from 'react-router-dom';

export default function OwnerApartmentsSection({ myApartments, statusBadgeClass }) {
  return (
    <section className="card">
      <h2>Vlasnik: moji apartmani</h2>
      <div className="list">
        {myApartments.map((apt) => (
          <article key={apt.id} className="list-item">
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
