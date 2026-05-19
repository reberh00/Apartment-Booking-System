import NotificationsSection from '../../components/sections/NotificationsSection';

export default function NotificationsPage({ notifications, markNotificationsRead }) {
  return (
    <NotificationsSection
      notifications={notifications}
      markNotificationsRead={markNotificationsRead}
    />
  );
}
