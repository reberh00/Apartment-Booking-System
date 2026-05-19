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
          </article>
        ))}
      </div>
    </section>
  );
}
