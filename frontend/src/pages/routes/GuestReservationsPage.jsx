import GuestReservationsSection from '../../components/sections/GuestReservationsSection';

export default function GuestReservationsPage({ guestReservations, statusBadgeClass, updateReservationStatus }) {
  return (
    <GuestReservationsSection
      guestReservations={guestReservations}
      statusBadgeClass={statusBadgeClass}
      updateReservationStatus={updateReservationStatus}
    />
  );
}
