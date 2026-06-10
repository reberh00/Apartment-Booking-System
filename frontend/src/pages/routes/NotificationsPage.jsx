import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";

function extractReservationId(content) {
  const match = content.match(/\[reservation:([0-9a-fA-F-]{36})\]/);
  return match ? match[1] : null;
}

function extractApartmentId(content) {
  const match = content.match(/\[apartment:([0-9a-fA-F-]{36})\]/);
  return match ? match[1] : null;
}

function stripReservationMarker(content) {
  return content
    .replace(/\s*\[reservation:[0-9a-fA-F-]{36}\]/, "")
    .replace(/\s*\[apartment:[0-9a-fA-F-]{36}\]/, "")
    .trim();
}

export default function NotificationsPage() {
  const { isOwner } = useAuth();
  const { notifications, markAllRead, markRead } = useNotifications();

  return (
    <section className="card">
      <div className="row between">
        <h2>Obavijesti</h2>
        <button onClick={markAllRead}>Označi sve kao pročitano</button>
      </div>
      <div className="list compact">
        {notifications.map((notification) => {
          const reservationId = extractReservationId(
            notification.content || "",
          );
          const apartmentId = extractApartmentId(notification.content || "");
          let detailsLink = reservationId
            ? isOwner
              ? `/app/owner/reservations/${reservationId}`
              : `/app/reservations/${reservationId}`
            : null;

          if (!detailsLink && apartmentId) {
            detailsLink = isOwner
              ? `/app/owner/apartments/${apartmentId}`
              : `/app/apartments/${apartmentId}`;
          }

          const displayContent = stripReservationMarker(
            notification.content || "",
          );
          const itemClass = `list-item notification-item ${
            notification.isRead ? "notification-read" : "notification-unread"
          }`;

          if (detailsLink) {
            return (
              <Link
                key={notification.id}
                to={detailsLink}
                className={`${itemClass} card-link-reset`}
                onClick={() => markRead(notification.id)}
              >
                <strong>{notification.type}</strong> — {displayContent}
              </Link>
            );
          }

          return (
            <div key={notification.id} className={itemClass}>
              <strong>{notification.type}</strong> — {displayContent}
            </div>
          );
        })}
      </div>
    </section>
  );
}
