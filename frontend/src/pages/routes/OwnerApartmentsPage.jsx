import OwnerApartmentsSection from '../../components/sections/OwnerApartmentsSection';

export default function OwnerApartmentsPage({ myApartments, statusBadgeClass }) {
  return (
    <OwnerApartmentsSection
      myApartments={myApartments}
      statusBadgeClass={statusBadgeClass}
    />
  );
}
