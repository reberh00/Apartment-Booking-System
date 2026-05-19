import AdminApartmentsSection from '../../components/sections/AdminApartmentsSection';

export default function AdminApartmentsPage({ adminApartments, statusBadgeClass, moderateApartment }) {
  return (
    <AdminApartmentsSection
      adminApartments={adminApartments}
      statusBadgeClass={statusBadgeClass}
      moderateApartment={moderateApartment}
    />
  );
}
