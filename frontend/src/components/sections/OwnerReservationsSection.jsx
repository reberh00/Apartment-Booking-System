import { Link } from 'react-router-dom';

export default function OwnerReservationsSection({ ownerReservations, statusBadgeClass, updateReservationStatus }) {
  return (
    <section className="card">
      <h2>Vlasnik: upravljanje rezervacijama</h2>
      <div className="list">
        {ownerReservations.map((reservation) => (
          <article key={reservation.id} className="list-item">
            <div className="row between">
              <h3>{reservation.apartment?.title}</h3>
              <span className={statusBadgeClass(reservation.status)}>{reservation.status}</span>
            </div>
            <p>Gost: {reservation.guest?.firstName} {reservation.guest?.lastName}</p>
            <div className="row gap">
              <Link to={`/app/owner/reservations/${reservation.id}`} className="badge badge-neutral">Detalji i chat</Link>
              <button type="button" onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}>Potvrdi</button>
              <button type="button" className="ghost" onClick={() => updateReservationStatus(reservation.id, 'REJECTED')}>Odbij</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
