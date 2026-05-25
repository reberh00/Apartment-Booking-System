import { useMemo, useState } from 'react';

export default function AdminUsersSection({ adminUsers, deleteUser, currentUserId }) {
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return adminUsers;
    }

    return adminUsers.filter((u) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const role = (u.role || '').toLowerCase();

      return fullName.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [adminUsers, query]);

  return (
    <section className="card">
      <h2>Admin: korisnici</h2>

      <label>
        Pretraži korisnika
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ime, prezime, email ili uloga"
        />
      </label>

      <p className="meta">Prikazano: {filteredUsers.length}</p>

      <div className="list">
        {filteredUsers.map((u) => (
          <article key={u.id} className="list-item row between">
            <div>
              <strong>{u.firstName} {u.lastName}</strong>
              <p>{u.email} • {u.role}</p>
            </div>
            {u.id !== currentUserId && u.role !== 'ADMIN' ? (
              <button className="ghost" onClick={() => deleteUser(u.id)}>Obriši korisnika</button>
            ) : null}
          </article>
        ))}

        {!filteredUsers.length ? <p>Nema korisnika za traženi pojam.</p> : null}
      </div>
    </section>
  );
}
