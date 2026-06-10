import { useAdminApartments } from "../../hooks/useAdminApartments";
import { statusBadgeClass } from "../../utils/status";

export default function AdminApartmentsPage() {
  const { adminApartments, moderateApartment } = useAdminApartments();

  return (
    <section className="card">
      <h2>Admin: moderacija apartmana</h2>
      <div className="list">
        {adminApartments.map((apt) => (
          <article key={apt.id} className="list-item">
            <div className="row between">
              <h3>{apt.title}</h3>
              <span className={statusBadgeClass(apt.status)}>{apt.status}</span>
            </div>
            <p>
              Vlasnik: {apt.owner?.firstName} {apt.owner?.lastName}
            </p>
            <div className="row gap">
              <button onClick={() => moderateApartment(apt.id, "APPROVED")}>
                Odobri
              </button>
              <button
                className="ghost"
                onClick={() => moderateApartment(apt.id, "REJECTED")}
              >
                Odbij
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
