import StatsLineChart from "./StatsLineChart";
import { formatCurrency, formatDate } from "./utils";

const PERIOD_OPTIONS = [
  { value: "1", label: "1 mjesec" },
  { value: "3", label: "3 mjeseca" },
  { value: "6", label: "6 mjeseci" },
  { value: "12", label: "1 godina" },
];

function periodLabel(months) {
  switch (months) {
    case "1":
      return "1 mjesec";
    case "3":
      return "3 mjeseca";
    case "6":
      return "6 mjeseci";
    default:
      return "1 godina";
  }
}

export default function ApartmentInfo({
  apartment,
  canViewStats,
  statsLoading,
  apartmentStats,
  isAdmin,
  onDeleteReview,
  statsPeriod,
  onStatsPeriodChange,
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

              <div className="row between" style={{ marginTop: "1rem" }}>
                <label htmlFor="stats-period">Period:</label>
                <select
                  id="stats-period"
                  value={statsPeriod}
                  onChange={(e) => onStatsPeriodChange?.(e.target.value)}
                >
                  {PERIOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <StatsLineChart
                data={apartmentStats.monthlyTrend}
                dataKey="income"
                stroke="#2563eb"
                title={`Prihod po mjesecima (${periodLabel(statsPeriod)})`}
                formatter={formatCurrency}
              />
              <StatsLineChart
                data={apartmentStats.monthlyTrend}
                dataKey="reservations"
                stroke="#f97316"
                title={`Broj rezervacija po mjesecima (${periodLabel(statsPeriod)})`}
                formatter={(value) => `${value} rezervacija`}
                roundTicks
              />
            </>
          ) : null}
        </article>
      ) : null}

      {(apartment.reviews || []).map((review) => (
        <article key={review.id} className="list-item">
          <div className="row between">
            <p>
              <strong>
                {review.guest?.firstName} {review.guest?.lastName}
              </strong>{" "}
              — {formatDate(review.createdAt)}
            </p>
            {isAdmin ? (
              <button
                type="button"
                className="ghost"
                onClick={() => onDeleteReview?.(review.id)}
              >
                Obriši
              </button>
            ) : null}
          </div>
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
