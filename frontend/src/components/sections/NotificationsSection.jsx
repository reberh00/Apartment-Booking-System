import { Link } from 'react-router-dom';

function extractReservationId(content) {
  const match = content.match(/\[reservation:([0-9a-fA-F-]{36})\]/);
  return match ? match[1] : null;
}

export default function NotificationsSection({ notifications, markNotificationsRead, isOwner }) {
  return (
    <section className="card">
      <div className="row between">
        <h2>Obavijesti</h2>
        <button onClick={markNotificationsRead}>Označi sve kao pročitano</button>
      </div>
      <div className="list compact">
        {notifications.map((notification) => (
          <div key={notification.id} className="list-item">
            <strong>{notification.type}</strong> — {notification.content}
            {notification.type === 'MESSAGE_NEW' && extractReservationId(notification.content) ? (
              <>
                {' '}
                <Link
                  to={isOwner
                    ? `/app/owner/reservations/${extractReservationId(notification.content)}`
                    : `/app/reservations/${extractReservationId(notification.content)}`}
                  className="badge badge-neutral"
                >
                  Otvori chat
                </Link>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
