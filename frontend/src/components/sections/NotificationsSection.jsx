export default function NotificationsSection({ notifications, markNotificationsRead }) {
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
          </div>
        ))}
      </div>
    </section>
  );
}
