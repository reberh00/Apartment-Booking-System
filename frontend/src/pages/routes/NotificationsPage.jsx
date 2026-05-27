import NotificationsSection from '../../components/sections/NotificationsSection';

export default function NotificationsPage({ notifications, markNotificationsRead, markNotificationRead, isOwner }) {
  return (
    <NotificationsSection
      notifications={notifications}
      markNotificationsRead={markNotificationsRead}
      markNotificationRead={markNotificationRead}
      isOwner={isOwner}
    />
  );
}
