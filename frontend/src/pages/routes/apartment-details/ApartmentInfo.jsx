import StatsLineChart from "./StatsLineChart";
import { formatCurrency, formatDate } from "./utils";

export default function ApartmentInfo({
  apartment,
  canViewStats,
  statsLoading,
  apartmentStats,
  isAdmin,
  onDeleteReview,
  statsStartDate,
  statsEndDate,
  onStatsStartDateChange,
  onStatsEndDateChange,
  showStatsDatePicker,
  onToggleStatsDatePicker,
}) {
  const currentMonth = new Date().toISOString().slice(0, 7);
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

              <div style={{ marginBottom: "1rem" }}>
                <button onClick={onToggleStatsDatePicker} className="btn">
                  {showStatsDatePicker ? "Zatvori kalendar" : "Odaberi period"}
                </button>
              </div>

              {showStatsDatePicker && (
                <div
                  className="form-group"
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "1rem",
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <label>Od:</label>
                      <input
                        type="month"
                        value={statsStartDate}
                        onChange={(e) =>
                          onStatsStartDateChange?.(e.target.value)
                        }
                        min="2000-01"
                        max={currentMonth}
                        style={{ marginLeft: "0.5rem" }}
                      />
                    </div>
                    <div>
                      <label>Do:</label>
                      <input
                        type="month"
                        value={statsEndDate}
                        onChange={(e) => onStatsEndDateChange?.(e.target.value)}
                        min="2000-01"
                        max={currentMonth}
                        style={{ marginLeft: "0.5rem" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {statsStartDate && statsEndDate && !showStatsDatePicker && (
                <p style={{ marginBottom: "1rem", color: "#666" }}>
                  Period: {statsStartDate} - {statsEndDate}
                </p>
              )}

              <StatsLineChart
                data={apartmentStats.monthlyTrend}
                dataKey="income"
                stroke="#2563eb"
                title="Prihod po mjesecima"
                formatter={formatCurrency}
              />
              <StatsLineChart
                data={apartmentStats.monthlyTrend}
                dataKey="reservations"
                stroke="#f97316"
                title="Broj rezervacija po mjesecima"
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
