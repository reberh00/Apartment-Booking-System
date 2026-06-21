import { useState } from "react";
import { useAnalytics } from "../../hooks/useAnalytics";

export default function OwnerAnalyticsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(true);

  const { analytics } = useAnalytics(startDate, endDate);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const handleApplyDates = () => {
    if (startDate && endDate) {
      setShowDatePicker(false);
    }
  };

  return (
    <section className="card">
      <h2>Vlasnik: analitika</h2>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="btn"
        >
          {showDatePicker ? "Zatvori kalendar" : "Odaberi period"}
        </button>
      </div>

      {showDatePicker && (
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
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min="2000-01"
                max={currentMonth}
                style={{ marginLeft: "0.5rem" }}
              />
            </div>
            <div>
              <label>Do:</label>
              <input
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min="2000-01"
                max={currentMonth}
                style={{ marginLeft: "0.5rem" }}
              />
            </div>
          </div>
          <button
            onClick={handleApplyDates}
            className="btn"
            disabled={!startDate || !endDate}
          >
            Primijeni
          </button>
        </div>
      )}

      {startDate && endDate && !showDatePicker && (
        <p style={{ marginBottom: "1rem", color: "#666" }}>
          Period: {startDate} - {endDate}
        </p>
      )}

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
