export default function ReservationFormSection({ reservationForm, setReservationForm, createReservation, checkAvailability }) {
  return (
    <section className="card">
      <h2>Nova rezervacija</h2>
      <form onSubmit={createReservation} className="grid grid-4">
        <label>Apartment ID<input value={reservationForm.apartmentId} onChange={(e) => setReservationForm((p) => ({ ...p, apartmentId: e.target.value }))} required /></label>
        <label>Check-in<input type="date" value={reservationForm.checkIn} onChange={(e) => setReservationForm((p) => ({ ...p, checkIn: e.target.value }))} required /></label>
        <label>Check-out<input type="date" value={reservationForm.checkOut} onChange={(e) => setReservationForm((p) => ({ ...p, checkOut: e.target.value }))} required /></label>
        <label>Broj gostiju<input type="number" min="1" value={reservationForm.numGuests} onChange={(e) => setReservationForm((p) => ({ ...p, numGuests: e.target.value }))} required /></label>
        <button type="submit">Pošalji rezervaciju</button>
        <button type="button" className="ghost" onClick={checkAvailability}>Provjeri dostupnost</button>
      </form>
    </section>
  );
}
