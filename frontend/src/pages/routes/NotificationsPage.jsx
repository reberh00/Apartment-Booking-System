import NotificationsSection from '../../components/sections/NotificationsSection';

export default function NotificationsPage({ notifications, markNotificationsRead, isOwner }) {
  return (
    <NotificationsSection
      notifications={notifications}
      markNotificationsRead={markNotificationsRead}
      isOwner={isOwner}
    />
  );
}
