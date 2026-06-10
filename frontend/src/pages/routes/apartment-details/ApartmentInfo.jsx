import StatsLineChart from "./StatsLineChart";
import { formatCurrency, formatDate } from "./utils";

export default function ApartmentInfo({
  apartment,
  canViewStats,
  statsLoading,
  apartmentStats,
}) {
  return (
    <div className="list compact">
      <article className="list-item">
        <h3>{apartment.title}</h3>
        <p>{apartment.description}</p>
        <p>
          {apartment.city}, {apartment.country}
        </p>
        <p>{apartment.address}</p>
        <p>Cijena: {apartment.pricePerNight} EUR / noć</p>
        <p>
          Max gostiju: {apartment.maxGuests} • Min noći: {apartment.minNights}
        </p>
        <p>Policy: {apartment.cancellationPolicy}</p>
        <p>
          Vlasnik: {apartment.owner?.firstName} {apartment.owner?.lastName}
        </p>
        <p>
          Prosječna ocjena:{" "}
          {apartment.avgRating ? apartment.avgRating.toFixed(2) : "Nema ocjena"}{" "}
          ({apartment.reviewCount})
        </p>
        <p>
          Sadržaji:{" "}
          {(apartment.contents || [])
            .map((item) => item.content?.name)
            .filter(Boolean)
            .join(", ") || "Nema odabranih sadržaja"}
        </p>
      </article>

      {canViewStats ? (
        <article className="list-item">
          <h3>Statistika apartmana</h3>
          {statsLoading ? <p>Učitavanje statistike...</p> : null}

          {!statsLoading && apartmentStats ? (
            <>
              <div className="grid grid-4">
                <div className="list-item">
                  <strong>Ukupno rezervacija</strong>
                  <p>{apartmentStats.totalReservations}</p>
                </div>
                <div className="list-item">
                  <strong>Realizirane rezervacije</strong>
                  <p>{apartmentStats.completedReservations}</p>
                </div>
                <div className="list-item">
                  <strong>Ukupan prihod</strong>
                  <p>{formatCurrency(apartmentStats.totalIncome)}</p>
                </div>
                <div className="list-item">
                  <strong>Na čekanju</strong>
                  <p>{apartmentStats.pendingReservations}</p>
                </div>
              </div>

              <div className="stats-year-list">
                <h4>Godišnje</h4>
                <div className="list compact">
                  {apartmentStats.yearlyTrend.length ? (
                    apartmentStats.yearlyTrend.map((yearRow) => (
                      <div
                        key={yearRow.label}
                        className="list-item row between"
                      >
                        <span>{yearRow.label}</span>
                        <span>
                          {yearRow.reservations} rezervacija •{" "}
                          {formatCurrency(yearRow.income)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="meta">Nema realiziranih rezervacija.</p>
                  )}
                </div>
              </div>

              <StatsLineChart
                data={apartmentStats.monthlyTrend}
                dataKey="income"
                stroke="#2563eb"
                title="Prihod po mjesecima (zadnjih 12 mjeseci)"
                formatter={formatCurrency}
              />
              <StatsLineChart
                data={apartmentStats.monthlyTrend}
                dataKey="reservations"
                stroke="#f97316"
                title="Broj rezervacija po mjesecima (zadnjih 12 mjeseci)"
                formatter={(value) => `${value} rezervacija`}
              />
            </>
          ) : null}
        </article>
      ) : null}

      {(apartment.reviews || []).map((review) => (
        <article key={review.id} className="list-item">
          <p>
            <strong>
              {review.guest?.firstName} {review.guest?.lastName}
            </strong>{" "}
            — {formatDate(review.createdAt)}
          </p>
          <p>Ocjena: {review.rating}/5</p>
          <p>{review.comment}</p>
          {review.ownerReply ? (
            <p>
              <strong>Odgovor vlasnika:</strong> {review.ownerReply}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
