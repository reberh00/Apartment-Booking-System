import AdminUsersSection from '../../components/sections/AdminUsersSection';

export default function AdminUsersPage({ adminUsers, deleteUser, currentUserId }) {
  return (
    <AdminUsersSection
      adminUsers={adminUsers}
      deleteUser={deleteUser}
      currentUserId={currentUserId}
    />
  );
}
