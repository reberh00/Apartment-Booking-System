import OwnerReservationsSection from '../../components/sections/OwnerReservationsSection';

export default function OwnerReservationsPage({
  ownerReservations,
  statusBadgeClass,
  updateReservationStatus,
  ownerReservationFilters,
  setOwnerReservationFilters,
  loadOwnerReservations,
}) {
  return (
    <OwnerReservationsSection
      ownerReservations={ownerReservations}
      statusBadgeClass={statusBadgeClass}
      updateReservationStatus={updateReservationStatus}
      ownerReservationFilters={ownerReservationFilters}
      setOwnerReservationFilters={setOwnerReservationFilters}
      loadOwnerReservations={loadOwnerReservations}
    />
  );
}
