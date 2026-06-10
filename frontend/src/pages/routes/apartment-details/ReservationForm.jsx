import { DayPicker } from "react-day-picker";
import { formatCurrency, isDateInRange } from "./utils";

export default function ReservationForm({
  selectedRange,
  onRangeSelect,
  onDayClick,
  disabledDateMatchers,
  apartment,
  dayPriceHint,
  availabilityLoading,
  calendarSelectionMessage,
  onSubmit,
  reservationForm,
  setReservationForm,
  reserving,
  canSubmitReservation,
  selectedNights,
  estimatedTotal,
}) {
  return (
    <section className="card">
      <h3>Rezerviraj ovaj apartman</h3>
      <div className="reservation-calendar-wrap">
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={onRangeSelect}
          onDayClick={onDayClick}
          numberOfMonths={2}
          disabled={disabledDateMatchers}
          min={Number(apartment.minNights || 1)}
          excludeDisabled
          components={{
            DayContent: ({ date }) => {
              const isSelected = isDateInRange(date, selectedRange);
              return (
                <span
                  className={`calendar-day-content ${isSelected ? "calendar-day-selected" : ""}`}
                >
                  <span>{date.getDate()}</span>
                  <span className="calendar-day-price">{dayPriceHint}</span>
                </span>
              );
            },
          }}
        />
        {availabilityLoading ? (
          <p className="meta">Učitavanje nedostupnih termina...</p>
        ) : null}
        <p className="meta">
          Nedostupni termini su označeni i ne mogu se odabrati.
        </p>
        {calendarSelectionMessage ? (
          <p className="meta">{calendarSelectionMessage}</p>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="grid grid-4">
        <label>
          Check-in
          <input
            type="text"
            value={reservationForm.checkIn}
            readOnly
            placeholder="Odaberite na kalendaru"
            required
          />
        </label>
        <label>
          Check-out
          <input
            type="text"
            value={reservationForm.checkOut}
            readOnly
            placeholder="Odaberite na kalendaru"
            required
          />
        </label>
        <label>
          Broj gostiju
          <input
            type="number"
            min="1"
            value={reservationForm.numGuests}
            onChange={(e) =>
              setReservationForm((prev) => ({
                ...prev,
                numGuests: e.target.value,
              }))
            }
            required
          />
        </label>
        <button type="submit" disabled={reserving || !canSubmitReservation}>
          {reserving ? "Slanje..." : "Pošalji rezervaciju"}
        </button>
        <div className="reservation-summary">
          <p>
            <strong>Noćenja:</strong> {selectedNights}
          </p>
          <p>
            <strong>Procijenjeni iznos:</strong> {formatCurrency(estimatedTotal)}
          </p>
          {selectedNights > 0 &&
          selectedNights < Number(apartment.minNights || 1) ? (
            <p className="meta">
              Minimalni boravak za ovaj apartman je {apartment.minNights} noći.
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
