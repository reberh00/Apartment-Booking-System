import AdminUsersSection from '../../components/sections/AdminUsersSection';

export default function AdminUsersPage({ adminUsers, deleteUser }) {
  return (
    <AdminUsersSection
      adminUsers={adminUsers}
      deleteUser={deleteUser}
    />
  );
}
