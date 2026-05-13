import { useEffect, useMemo, useState } from 'react';
import { api } from './api';

const defaultSearch = {
  city: '',
  checkIn: '',
  checkOut: '',
  guests: '',
  minPrice: '',
  maxPrice: '',
};

const defaultApartmentForm = {
  title: '',
  description: '',
  city: '',
  country: '',
  address: '',
  latitude: 45.815,
  longitude: 15.9819,
  pricePerNight: 100,
  maxGuests: 2,
  minNights: 1,
  cancellationPolicy: 'FLEXIBLE',
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [search, setSearch] = useState(defaultSearch);
  const [apartmentsResult, setApartmentsResult] = useState({ apartments: [], total: 0 });
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'GUEST',
    phone: '',
  });

  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '', avatarUrl: '' });

  const [reservationForm, setReservationForm] = useState({ apartmentId: '', checkIn: '', checkOut: '', numGuests: 1 });
  const [guestReservations, setGuestReservations] = useState([]);
  const [ownerReservations, setOwnerReservations] = useState([]);
  const [myApartments, setMyApartments] = useState([]);
  const [newApartment, setNewApartment] = useState(defaultApartmentForm);
  const [analytics, setAnalytics] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [chatForm, setChatForm] = useState({ reservationId: '', content: '' });
  const [chatMessages, setChatMessages] = useState([]);
  const [reviewForm, setReviewForm] = useState({ reservationId: '', rating: 5, comment: '' });
  const [replyForm, setReplyForm] = useState({ reviewId: '', reply: '' });

  const [adminApartments, setAdminApartments] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);

  const isOwner = user?.role === 'OWNER';
  const isAdmin = user?.role === 'ADMIN';

  const statusBadgeClass = useMemo(() => {
    return (status) => {
      if (status === 'APPROVED' || status === 'CONFIRMED' || status === 'COMPLETED') return 'badge badge-ok';
      if (status === 'PENDING') return 'badge badge-warn';
      return 'badge badge-neutral';
    };
  }, []);

  useEffect(() => {
    void loadApartments();
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    void loadMe();
  }, [token]);

  useEffect(() => {
    if (!user || !token) return;
    void Promise.all([
      loadNotifications(),
      loadGuestReservations(),
      isOwner ? loadOwnerReservations() : Promise.resolve(),
      isOwner ? loadMyApartments() : Promise.resolve(),
      isOwner ? loadAnalytics() : Promise.resolve(),
      isAdmin ? loadAdminApartments() : Promise.resolve(),
      isAdmin ? loadAdminUsers() : Promise.resolve(),
    ]);
  }, [user, token, isOwner, isAdmin]);

  function setFeedback(message, isError = false) {
    if (isError) {
      setError(message);
      setNotice('');
      return;
    }
    setNotice(message);
    setError('');
  }

  async function loadApartments() {
    try {
      const params = new URLSearchParams();
      Object.entries(search).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const data = await api.get(`/apartments?${params.toString()}`);
      setApartmentsResult(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadMe() {
    try {
      const current = await api.get('/auth/me', token);
      setUser(current);
      setProfileForm({
        firstName: current.firstName || '',
        lastName: current.lastName || '',
        phone: current.phone || '',
        avatarUrl: current.avatarUrl || '',
      });
    } catch (err) {
      logout();
      setFeedback(err.message, true);
    }
  }

  async function loadGuestReservations() {
    try {
      const data = await api.get('/reservations/my', token);
      setGuestReservations(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadOwnerReservations() {
    try {
      const data = await api.get('/reservations/owner', token);
      setOwnerReservations(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadMyApartments() {
    try {
      const data = await api.get('/apartments/owner/mine', token);
      setMyApartments(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadAnalytics() {
    try {
      const data = await api.get('/analytics/owner', token);
      setAnalytics(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadNotifications() {
    try {
      const data = await api.get('/notifications', token);
      setNotifications(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadAdminApartments() {
    try {
      const data = await api.get('/admin/apartments', token);
      setAdminApartments(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadAdminUsers() {
    try {
      const data = await api.get('/admin/users', token);
      setAdminUsers(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function submitAuth(e) {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const data = await api.post(endpoint, payload);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setFeedback('Uspješno ste prijavljeni.');
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();
    try {
      const updated = await api.patch('/users/me', profileForm, token);
      setUser(updated);
      setFeedback('Profil je ažuriran.');
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function createReservation(e) {
    e.preventDefault();
    try {
      await api.post('/reservations', {
        ...reservationForm,
        numGuests: Number(reservationForm.numGuests),
      }, token);
      setFeedback('Rezervacija je poslana vlasniku.');
      await loadGuestReservations();
      await loadApartments();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function checkAvailability() {
    try {
      if (!reservationForm.apartmentId || !reservationForm.checkIn || !reservationForm.checkOut) {
        setFeedback('Upišite apartmentId, check-in i check-out.', true);
        return;
      }
      const params = new URLSearchParams({
        apartmentId: reservationForm.apartmentId,
        checkIn: reservationForm.checkIn,
        checkOut: reservationForm.checkOut,
      });
      const data = await api.get(`/reservations/check-availability?${params.toString()}`);
      setFeedback(data.available ? 'Termin je slobodan.' : 'Termin nije slobodan.', !data.available);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function updateReservationStatus(id, status) {
    try {
      await api.patch(`/reservations/${id}/status`, { status }, token);
      setFeedback('Status rezervacije je promijenjen.');
      await Promise.all([loadGuestReservations(), isOwner ? loadOwnerReservations() : Promise.resolve()]);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function createApartment(e) {
    e.preventDefault();
    try {
      await api.post('/apartments', {
        ...newApartment,
        latitude: Number(newApartment.latitude),
        longitude: Number(newApartment.longitude),
        pricePerNight: Number(newApartment.pricePerNight),
        maxGuests: Number(newApartment.maxGuests),
        minNights: Number(newApartment.minNights),
      }, token);
      setFeedback('Apartman je kreiran i čeka admin odobrenje.');
      setNewApartment(defaultApartmentForm);
      await loadMyApartments();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function moderateApartment(id, status) {
    try {
      await api.patch(`/admin/apartments/${id}/status`, { status }, token);
      setFeedback(`Apartman je ${status === 'APPROVED' ? 'odobren' : 'odbijen'}.`);
      await loadAdminApartments();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function deleteUser(id) {
    try {
      await api.del(`/admin/users/${id}`, token);
      setFeedback('Korisnik je obrisan.');
      await loadAdminUsers();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function markNotificationsRead() {
    try {
      await api.patch('/notifications/read-all', {}, token);
      setFeedback('Obavijesti su označene kao pročitane.');
      await loadNotifications();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadMessages(e) {
    e.preventDefault();
    try {
      const data = await api.get(`/messages/${chatForm.reservationId}`, token);
      setChatMessages(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    try {
      await api.post('/messages', chatForm, token);
      setFeedback('Poruka je poslana.');
      const data = await api.get(`/messages/${chatForm.reservationId}`, token);
      setChatMessages(data);
      setChatForm((prev) => ({ ...prev, content: '' }));
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function createReview(e) {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        ...reviewForm,
        rating: Number(reviewForm.rating),
      }, token);
      setFeedback('Recenzija je spremljena.');
      setReviewForm({ reservationId: '', rating: 5, comment: '' });
      await loadGuestReservations();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function replyToReview(e) {
    e.preventDefault();
    try {
      await api.patch(`/reviews/${replyForm.reviewId}/reply`, { reply: replyForm.reply }, token);
      setFeedback('Odgovor na recenziju je spremljen.');
      setReplyForm({ reviewId: '', reply: '' });
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setFeedback('Odjavljeni ste.');
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>Apartmani Platforma</h1>
        <p>Frontend usklađen s postojećim backend API-jem i funkcionalnostima iz razrade.</p>
      </header>

      {error ? <div className="alert error">{error}</div> : null}
      {notice ? <div className="alert notice">{notice}</div> : null}

      <section className="card">
        <h2>Javno pretraživanje apartmana</h2>
        <div className="grid grid-6">
          {Object.entries(search).map(([key, value]) => (
            <label key={key}>
              {key}
              <input
                value={value}
                onChange={(e) => setSearch((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={key}
              />
            </label>
          ))}
        </div>
        <button onClick={loadApartments}>Pretraži</button>
        <p className="meta">Rezultata: {apartmentsResult.total}</p>
        <div className="list">
          {apartmentsResult.apartments.map((apt) => (
            <article key={apt.id} className="list-item">
              <h3>{apt.title}</h3>
              <p>{apt.city}, {apt.country}</p>
              <p>{apt.pricePerNight} EUR / noć • max {apt.maxGuests} gostiju</p>
              <p>ID: <code>{apt.id}</code></p>
            </article>
          ))}
        </div>
      </section>

      {!user ? (
        <section className="card">
          <h2>{authMode === 'login' ? 'Prijava' : 'Registracija'}</h2>
          <form onSubmit={submitAuth} className="grid grid-2">
            <label>
              Email
              <input value={authForm.email} onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))} required />
            </label>
            <label>
              Lozinka
              <input type="password" value={authForm.password} onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))} required />
            </label>
            {authMode === 'register' ? (
              <>
                <label>
                  Ime
                  <input value={authForm.firstName} onChange={(e) => setAuthForm((p) => ({ ...p, firstName: e.target.value }))} required />
                </label>
                <label>
                  Prezime
                  <input value={authForm.lastName} onChange={(e) => setAuthForm((p) => ({ ...p, lastName: e.target.value }))} required />
                </label>
                <label>
                  Uloga
                  <select value={authForm.role} onChange={(e) => setAuthForm((p) => ({ ...p, role: e.target.value }))}>
                    <option value="GUEST">GUEST</option>
                    <option value="OWNER">OWNER</option>
                  </select>
                </label>
                <label>
                  Telefon
                  <input value={authForm.phone} onChange={(e) => setAuthForm((p) => ({ ...p, phone: e.target.value }))} />
                </label>
              </>
            ) : null}
            <button type="submit">{authMode === 'login' ? 'Prijavi se' : 'Registriraj se'}</button>
          </form>
          <button className="ghost" onClick={() => setAuthMode((m) => (m === 'login' ? 'register' : 'login'))}>
            {authMode === 'login' ? 'Nemate račun? Registracija' : 'Već imate račun? Prijava'}
          </button>
        </section>
      ) : (
        <>
          <section className="card">
            <div className="row between">
              <h2>Korisnički profil ({user.role})</h2>
              <button onClick={logout}>Odjava</button>
            </div>
            <form onSubmit={updateProfile} className="grid grid-2">
              <label>Ime<input value={profileForm.firstName} onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))} /></label>
              <label>Prezime<input value={profileForm.lastName} onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))} /></label>
              <label>Telefon<input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} /></label>
              <label>Avatar URL<input value={profileForm.avatarUrl} onChange={(e) => setProfileForm((p) => ({ ...p, avatarUrl: e.target.value }))} /></label>
              <button type="submit">Spremi profil</button>
            </form>
          </section>

          <section className="card">
            <h2>Nova rezervacija</h2>
            <form onSubmit={createReservation} className="grid grid-4">
              <label>Apartment ID<input value={reservationForm.apartmentId} onChange={(e) => setReservationForm((p) => ({ ...p, apartmentId: e.target.value }))} required /></label>
              <label>Check-in<input type="date" value={reservationForm.checkIn} onChange={(e) => setReservationForm((p) => ({ ...p, checkIn: e.target.value }))} required /></label>
              <label>Check-out<input type="date" value={reservationForm.checkOut} onChange={(e) => setReservationForm((p) => ({ ...p, checkOut: e.target.value }))} required /></label>
              <label>Broj gostiju<input type="number" min="1" value={reservationForm.numGuests} onChange={(e) => setReservationForm((p) => ({ ...p, numGuests: e.target.value }))} required /></label>
              <button type="submit">Pošalji rezervaciju</button>
              <button type="button" className="ghost" onClick={checkAvailability}>Provjeri dostupnost</button>
            </form>
          </section>

          <section className="card">
            <h2>Moje rezervacije (gost)</h2>
            <div className="list">
              {guestReservations.map((reservation) => (
                <article key={reservation.id} className="list-item">
                  <div className="row between">
                    <h3>{reservation.apartment?.title || reservation.apartmentId}</h3>
                    <span className={statusBadgeClass(reservation.status)}>{reservation.status}</span>
                  </div>
                  <p>{String(reservation.checkIn).slice(0, 10)} - {String(reservation.checkOut).slice(0, 10)}</p>
                  <div className="row gap">
                    <button type="button" onClick={() => updateReservationStatus(reservation.id, 'CANCELLED')}>Otkaži</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Poruke unutar rezervacije</h2>
            <form onSubmit={loadMessages} className="grid grid-2">
              <label>Reservation ID<input value={chatForm.reservationId} onChange={(e) => setChatForm((p) => ({ ...p, reservationId: e.target.value }))} required /></label>
              <button type="submit">Učitaj chat</button>
            </form>
            <form onSubmit={sendMessage} className="grid grid-2">
              <label>Nova poruka<input value={chatForm.content} onChange={(e) => setChatForm((p) => ({ ...p, content: e.target.value }))} required /></label>
              <button type="submit">Pošalji poruku</button>
            </form>
            <div className="list compact">
              {chatMessages.map((message) => (
                <div key={message.id} className="list-item">
                  <strong>{message.sender?.firstName} {message.sender?.lastName}:</strong> {message.content}
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Recenzije</h2>
            <form onSubmit={createReview} className="grid grid-3">
              <label>Reservation ID<input value={reviewForm.reservationId} onChange={(e) => setReviewForm((p) => ({ ...p, reservationId: e.target.value }))} required /></label>
              <label>Ocjena (1-5)<input type="number" min="1" max="5" value={reviewForm.rating} onChange={(e) => setReviewForm((p) => ({ ...p, rating: e.target.value }))} required /></label>
              <label>Komentar<input value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} required /></label>
              <button type="submit">Pošalji recenziju</button>
            </form>

            {isOwner ? (
              <form onSubmit={replyToReview} className="grid grid-2">
                <label>Review ID<input value={replyForm.reviewId} onChange={(e) => setReplyForm((p) => ({ ...p, reviewId: e.target.value }))} required /></label>
                <label>Odgovor vlasnika<input value={replyForm.reply} onChange={(e) => setReplyForm((p) => ({ ...p, reply: e.target.value }))} required /></label>
                <button type="submit">Odgovori na recenziju</button>
              </form>
            ) : null}
          </section>

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

          {isOwner ? (
            <>
              <section className="card">
                <h2>Vlasnik: moji apartmani</h2>
                <div className="list">
                  {myApartments.map((apt) => (
                    <article key={apt.id} className="list-item">
                      <div className="row between">
                        <h3>{apt.title}</h3>
                        <span className={statusBadgeClass(apt.status)}>{apt.status}</span>
                      </div>
                      <p>{apt.city}, {apt.country}</p>
                      <p>Rezervacije: {apt._count?.reservations || 0}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="card">
                <h2>Vlasnik: dodaj apartman</h2>
                <form onSubmit={createApartment} className="grid grid-3">
                  {Object.entries(newApartment).map(([key, value]) => (
                    <label key={key}>
                      {key}
                      {key === 'cancellationPolicy' ? (
                        <select value={value} onChange={(e) => setNewApartment((p) => ({ ...p, [key]: e.target.value }))}>
                          <option value="FLEXIBLE">FLEXIBLE</option>
                          <option value="MODERATE">MODERATE</option>
                          <option value="STRICT">STRICT</option>
                        </select>
                      ) : (
                        <input
                          value={value}
                          onChange={(e) => setNewApartment((p) => ({ ...p, [key]: e.target.value }))}
                          required
                        />
                      )}
                    </label>
                  ))}
                  <button type="submit">Kreiraj apartman</button>
                </form>
              </section>

              <section className="card">
                <h2>Vlasnik: upravljanje rezervacijama</h2>
                <div className="list">
                  {ownerReservations.map((reservation) => (
                    <article key={reservation.id} className="list-item">
                      <div className="row between">
                        <h3>{reservation.apartment?.title}</h3>
                        <span className={statusBadgeClass(reservation.status)}>{reservation.status}</span>
                      </div>
                      <p>Gost: {reservation.guest?.firstName} {reservation.guest?.lastName}</p>
                      <div className="row gap">
                        <button type="button" onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}>Potvrdi</button>
                        <button type="button" className="ghost" onClick={() => updateReservationStatus(reservation.id, 'REJECTED')}>Odbij</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="card">
                <h2>Vlasnik: analitika</h2>
                {analytics ? (
                  <div className="grid grid-2">
                    <div className="list-item">
                      <h3>Apartmani</h3>
                      <p>{analytics.apartments.length}</p>
                    </div>
                    <div className="list-item">
                      <h3>Mjesečni prihodi zapisa</h3>
                      <p>{analytics.monthlyIncome.length}</p>
                    </div>
                  </div>
                ) : (
                  <p>Nema podataka.</p>
                )}
              </section>
            </>
          ) : null}

          {isAdmin ? (
            <>
              <section className="card">
                <h2>Admin: moderacija apartmana</h2>
                <div className="list">
                  {adminApartments.map((apt) => (
                    <article key={apt.id} className="list-item">
                      <div className="row between">
                        <h3>{apt.title}</h3>
                        <span className={statusBadgeClass(apt.status)}>{apt.status}</span>
                      </div>
                      <p>Vlasnik: {apt.owner?.firstName} {apt.owner?.lastName}</p>
                      <div className="row gap">
                        <button onClick={() => moderateApartment(apt.id, 'APPROVED')}>Odobri</button>
                        <button className="ghost" onClick={() => moderateApartment(apt.id, 'REJECTED')}>Odbij</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

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
            </>
          ) : null}
        </>
      )}
    </main>
  );
}
