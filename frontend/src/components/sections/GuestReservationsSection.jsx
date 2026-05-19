export default function GuestReservationsSection({ guestReservations, statusBadgeClass, updateReservationStatus }) {
  return (
    <section className="card">
      <h2>Moje rezervacije (gost)</h2>
      <div className="list">
        {guestReservations.map((reservation) => (
          <article key={reservation.id} className="list-item">
            <div className="row between">
              <h3>{reservation.apartment?.title || reservation.apartmentId}</h3>
              <span className={statusBadgeClass(reservation.status)}>{reservation.status}</span>
            </div>
            <p>{String(reservation.checkIn).slice(0, 10)} - {String(reservation.checkOut).slice(0, 10)}</p>
            <div className="row gap">
              <button type="button" onClick={() => updateReservationStatus(reservation.id, 'CANCELLED')}>Otkaži</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
