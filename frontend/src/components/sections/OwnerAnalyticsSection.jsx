export default function OwnerAnalyticsSection({ analytics }) {
  return (
    <section className="card">
      <h2>Vlasnik: analitika</h2>
      {analytics ? (
        <div className="grid grid-2">
          <div className="list-item">
            <h3>Apartmani</h3>
            <p>{analytics.apartments.length}</p>
          </div>
          <div className="list-item">
            <h3>Mjesečni prihodi zapisa</h3>
            <p>{analytics.monthlyIncome.length}</p>
          </div>
        </div>
      ) : (
        <p>Nema podataka.</p>
      )}
    </section>
  );
}
