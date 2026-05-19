export default function AdminUsersSection({ adminUsers, deleteUser }) {
  return (
    <section className="card">
      <h2>Admin: korisnici</h2>
      <div className="list">
        {adminUsers.map((u) => (
          <article key={u.id} className="list-item row between">
            <div>
              <strong>{u.firstName} {u.lastName}</strong>
              <p>{u.email} • {u.role}</p>
            </div>
            <button className="ghost" onClick={() => deleteUser(u.id)}>Obriši korisnika</button>
          </article>
        ))}
      </div>
    </section>
  );
}
