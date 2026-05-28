import { Link } from 'react-router-dom';

export default function OwnerReservationsSection({
  ownerReservations,
  statusBadgeClass,
  updateReservationStatus,
  ownerReservationFilters,
  setOwnerReservationFilters,
  loadOwnerReservations,
}) {
  function formatDate(date) {
    const parsed = new Date(date);
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function getStayNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.round((end - start) / msPerDay));
  }

  return (
    <section className="card">
      <h2>Vlasnik: upravljanje rezervacijama</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void loadOwnerReservations();
        }}
        className="grid grid-3"
      >
        <label>
          Status
          <select
            value={ownerReservationFilters.status}
            onChange={(e) => setOwnerReservationFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Svi</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </label>

        <label>
          Od datuma
          <input
            type="date"
            value={ownerReservationFilters.checkIn}
            onChange={(e) => setOwnerReservationFilters((prev) => ({ ...prev, checkIn: e.target.value }))}
          />
        </label>

        <label>
          Do datuma
          <input
            type="date"
            value={ownerReservationFilters.checkOut}
            onChange={(e) => setOwnerReservationFilters((prev) => ({ ...prev, checkOut: e.target.value }))}
          />
        </label>

        <button type="submit">Filtriraj</button>
      </form>

      <div className="list">
        {ownerReservations.map((reservation) => (
          <article key={reservation.id} className="list-item">
            <div className="row between">
              <h3>{reservation.apartment?.title}</h3>
              <span className={statusBadgeClass(reservation.status)}>{reservation.status}</span>
            </div>
            <p>Gost: {reservation.guest?.firstName} {reservation.guest?.lastName}</p>
            <p>Boravak: {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}</p>
            <p>Trajanje: {getStayNights(reservation.checkIn, reservation.checkOut)} noći</p>
            <div className="row gap">
              <Link to={`/app/owner/reservations/${reservation.id}`} className="badge badge-neutral">Detalji i chat</Link>
              {reservation.status === 'PENDING' ? (
                <>
                  <button type="button" onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}>Potvrdi</button>
                  <button type="button" className="ghost" onClick={() => updateReservationStatus(reservation.id, 'REJECTED')}>Odbij</button>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
