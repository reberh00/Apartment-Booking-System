import ReservationFormSection from '../../components/sections/ReservationFormSection';

export default function ReservationCreatePage({ reservationForm, setReservationForm, createReservation, checkAvailability }) {
  return (
    <ReservationFormSection
      reservationForm={reservationForm}
      setReservationForm={setReservationForm}
      createReservation={createReservation}
      checkAvailability={checkAvailability}
    />
  );
}
