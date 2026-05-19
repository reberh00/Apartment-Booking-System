import OwnerReservationsSection from '../../components/sections/OwnerReservationsSection';

export default function OwnerReservationsPage({ ownerReservations, statusBadgeClass, updateReservationStatus }) {
  return (
    <OwnerReservationsSection
      ownerReservations={ownerReservations}
      statusBadgeClass={statusBadgeClass}
      updateReservationStatus={updateReservationStatus}
    />
  );
}
