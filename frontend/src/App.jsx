import { useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { api } from "./api";
import { defaultApartmentForm, defaultSearch } from "./constants/forms";
import PublicPage from "./pages/PublicPage";
import GuestSearchPage from "./pages/routes/GuestSearchPage";
import ProfilePage from "./pages/routes/ProfilePage";
import ApartmentDetailsPage from "./pages/routes/ApartmentDetailsPage";
import GuestReservationsPage from "./pages/routes/GuestReservationsPage";
import ReservationDetailsPage from "./pages/routes/ReservationDetailsPage";
import NotificationsPage from "./pages/routes/NotificationsPage";
import OwnerApartmentsPage from "./pages/routes/OwnerApartmentsPage";
import OwnerApartmentCreatePage from "./pages/routes/OwnerApartmentCreatePage";
import OwnerReservationsPage from "./pages/routes/OwnerReservationsPage";
import OwnerAnalyticsPage from "./pages/routes/OwnerAnalyticsPage";
import AdminApartmentsPage from "./pages/routes/AdminApartmentsPage";
import AdminUsersPage from "./pages/routes/AdminUsersPage";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!token);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState(defaultSearch);
  const [apartmentsResult, setApartmentsResult] = useState({
    apartments: [],
    total: 0,
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "GUEST",
    phone: "",
  });

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatarUrl: "",
  });

  const [guestReservations, setGuestReservations] = useState([]);
  const [ownerReservations, setOwnerReservations] = useState([]);
  const [ownerReservationFilters, setOwnerReservationFilters] = useState({
    status: "",
    checkIn: "",
    checkOut: "",
  });
  const [myApartments, setMyApartments] = useState([]);
  const [newApartment, setNewApartment] = useState(defaultApartmentForm);
  const [contentsOptions, setContentsOptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [adminApartments, setAdminApartments] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);

  const isOwner = user?.role === "OWNER";
  const isAdmin = user?.role === "ADMIN";

  const statusBadgeClass = useMemo(() => {
    return (status) => {
      if (
        status === "APPROVED" ||
        status === "CONFIRMED" ||
        status === "COMPLETED"
      )
        return "badge badge-ok";
      if (status === "PENDING") return "badge badge-warn";
      return "badge badge-neutral";
    };
  }, []);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.reduce(
      (count, notification) => (notification.isRead ? count : count + 1),
      0,
    );
  }, [notifications]);

  useEffect(() => {
    void loadApartments();
    void loadContents();
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setAuthReady(true);
      return;
    }
    setAuthReady(false);
    void loadMe().finally(() => setAuthReady(true));
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
      setNotice("");
      return;
    }
    setNotice(message);
    setError("");
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

  async function loadContents() {
    try {
      const data = await api.get("/contents");
      setContentsOptions(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadMe() {
    try {
      const current = await api.get("/auth/me", token);
      setUser(current);
      setProfileForm({
        firstName: current.firstName || "",
        lastName: current.lastName || "",
        phone: current.phone || "",
        avatarUrl: current.avatarUrl || "",
      });
    } catch (err) {
      logout();
      setFeedback(err.message, true);
    }
  }

  async function loadGuestReservations() {
    try {
      const data = await api.get("/reservations/my", token);
      setGuestReservations(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadOwnerReservations() {
    try {
      const params = new URLSearchParams();
      Object.entries(ownerReservationFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const query = params.toString();
      const data = await api.get(
        `/reservations/owner${query ? `?${query}` : ""}`,
        token,
      );
      setOwnerReservations(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadMyApartments() {
    try {
      const data = await api.get("/apartments/owner/mine", token);
      setMyApartments(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadAnalytics() {
    try {
      const data = await api.get("/analytics/owner", token);
      setAnalytics(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadNotifications() {
    try {
      const data = await api.get("/notifications", token);
      setNotifications(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadAdminApartments() {
    try {
      const data = await api.get("/admin/apartments", token);
      setAdminApartments(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function loadAdminUsers() {
    try {
      const data = await api.get("/admin/users", token);
      setAdminUsers(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function submitAuth(e) {
    e.preventDefault();
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        authMode === "login"
          ? { email: authForm.email, password: authForm.password }
          : authForm;

      const data = await api.post(endpoint, payload);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      setFeedback("Uspješno ste prijavljeni.");
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();
    try {
      const updated = await api.patch("/users/me", profileForm, token);
      setUser(updated);
      setFeedback("Profil je ažuriran.");
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function createReservationForApartment(apartmentId, payload) {
    try {
      await api.post(
        "/reservations",
        {
          apartmentId,
          checkIn: payload.checkIn,
          checkOut: payload.checkOut,
          numGuests: Number(payload.numGuests),
        },
        token,
      );
      setFeedback("Rezervacija je poslana vlasniku.");
      await loadGuestReservations();
      await loadApartments();
    } catch (err) {
      setFeedback(err.message, true);
      throw err;
    }
  }

  async function checkApartmentAvailability(apartmentId, checkIn, checkOut) {
    try {
      if (!apartmentId || !checkIn || !checkOut) {
        setFeedback("Upišite check-in i check-out.", true);
        return;
      }
      const params = new URLSearchParams({
        apartmentId,
        checkIn,
        checkOut,
      });
      const data = await api.get(
        `/reservations/check-availability?${params.toString()}`,
      );
      setFeedback(
        data.available ? "Termin je slobodan." : "Termin nije slobodan.",
        !data.available,
      );
    } catch (err) {
      setFeedback(err.message, true);
      throw err;
    }
  }

  async function updateReservationStatus(id, status) {
    try {
      await api.patch(`/reservations/${id}/status`, { status }, token);
      setFeedback("Status rezervacije je promijenjen.");
      await Promise.all([
        loadGuestReservations(),
        isOwner ? loadOwnerReservations() : Promise.resolve(),
      ]);
    } catch (err) {
      setFeedback(err.message, true);
      throw err;
    }
  }

  async function createApartment(e) {
    e.preventDefault();
    try {
      await api.post(
        "/apartments",
        {
          ...newApartment,
          latitude: Number(newApartment.latitude),
          longitude: Number(newApartment.longitude),
          pricePerNight: Number(newApartment.pricePerNight),
          maxGuests: Number(newApartment.maxGuests),
          minNights: Number(newApartment.minNights),
        },
        token,
      );
      setFeedback("Apartman je kreiran i čeka admin odobrenje.");
      setNewApartment(defaultApartmentForm);
      await loadMyApartments();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function updateApartment(id, payload) {
    try {
      await api.put(`/apartments/${id}`, payload, token);
      setFeedback("Detalji apartmana su spremljeni.");
      await Promise.all([loadMyApartments(), loadApartments()]);
    } catch (err) {
      setFeedback(err.message, true);
      throw err;
    }
  }

  async function moderateApartment(id, status) {
    try {
      await api.patch(`/admin/apartments/${id}/status`, { status }, token);
      setFeedback(
        `Apartman je ${status === "APPROVED" ? "odobren" : "odbijen"}.`,
      );
      await loadAdminApartments();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function deleteUser(id) {
    try {
      await api.del(`/admin/users/${id}`, token);
      setFeedback("Korisnik je obrisan.");
      await loadAdminUsers();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function markNotificationsRead() {
    try {
      await api.patch("/notifications/read-all", {}, token);
      setFeedback("Obavijesti su označene kao pročitane.");
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true })),
      );
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function markNotificationRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`, {}, token);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setFeedback("Odjavljeni ste.");
  }

  function routeClassName({ isActive }) {
    return isActive ? "badge badge-ok" : "badge badge-neutral";
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>Apartmani Platforma</h1>
      </header>

      {error ? <div className="alert error">{error}</div> : null}
      {notice ? <div className="alert notice">{notice}</div> : null}

      {user ? (
        <section className="card">
          <div className="row gap">
            <NavLink to="/app/search" className={routeClassName}>
              Pretraga
            </NavLink>
            <NavLink to="/app/profile" className={routeClassName}>
              Profil
            </NavLink>
            <NavLink to="/app/reservations/my" className={routeClassName}>
              Moje rezervacije
            </NavLink>
            <NavLink to="/app/notifications" className={routeClassName}>
              <span className="row gap">
                Obavijesti
                {unreadNotificationsCount > 0 ? (
                  <span className="badge badge-warn notif-bubble">
                    {unreadNotificationsCount}
                  </span>
                ) : null}
              </span>
            </NavLink>
            {isOwner ? (
              <NavLink to="/app/owner/apartments" className={routeClassName}>
                Owner panel
              </NavLink>
            ) : null}
            {isOwner ? (
              <NavLink to="/app/owner/reservations" className={routeClassName}>
                Owner rezervacije
              </NavLink>
            ) : null}
            {isOwner ? (
              <NavLink to="/app/owner/analytics" className={routeClassName}>
                Owner analitika
              </NavLink>
            ) : null}
            {isAdmin ? (
              <NavLink to="/app/admin/apartments" className={routeClassName}>
                Admin panel
              </NavLink>
            ) : null}
            {isAdmin ? (
              <NavLink to="/app/admin/users" className={routeClassName}>
                Admin korisnici
              </NavLink>
            ) : null}
          </div>
        </section>
      ) : null}

      {!authReady ? (
        <section className="card">
          <p className="meta">Učitavanje...</p>
        </section>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/app/profile" replace />
              ) : (
                <PublicPage
                  search={search}
                  setSearch={setSearch}
                  loadApartments={loadApartments}
                  apartmentsResult={apartmentsResult}
                  authMode={authMode}
                  setAuthMode={setAuthMode}
                  authForm={authForm}
                  setAuthForm={setAuthForm}
                  submitAuth={submitAuth}
                />
              )
            }
          />

          <Route
            path="/app/search"
            element={
              user ? (
                <GuestSearchPage
                  search={search}
                  setSearch={setSearch}
                  loadApartments={loadApartments}
                  apartmentsResult={apartmentsResult}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/apartments/:apartmentId"
            element={
              <ApartmentDetailsPage
                user={user}
                token={token}
                setFeedback={setFeedback}
                updateApartment={updateApartment}
                contentsOptions={contentsOptions}
                createReservationForApartment={createReservationForApartment}
                checkApartmentAvailability={checkApartmentAvailability}
                defaultBackPath={user ? "/app/search" : "/"}
              />
            }
          />

          <Route
            path="/app/apartments/:apartmentId"
            element={
              user ? (
                <ApartmentDetailsPage
                  user={user}
                  token={token}
                  setFeedback={setFeedback}
                  updateApartment={updateApartment}
                  contentsOptions={contentsOptions}
                  createReservationForApartment={createReservationForApartment}
                  checkApartmentAvailability={checkApartmentAvailability}
                  defaultBackPath="/app/search"
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/app/profile"
            element={
              user ? (
                <ProfilePage
                  user={user}
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  updateProfile={updateProfile}
                  logout={logout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/app/reservations/my"
            element={
              user ? (
                <GuestReservationsPage
                  guestReservations={guestReservations}
                  statusBadgeClass={statusBadgeClass}
                  updateReservationStatus={updateReservationStatus}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/app/reservations/:reservationId"
            element={
              user ? (
                <ReservationDetailsPage
                  user={user}
                  token={token}
                  setFeedback={setFeedback}
                  statusBadgeClass={statusBadgeClass}
                  updateReservationStatus={updateReservationStatus}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/app/notifications"
            element={
              user ? (
                <NotificationsPage
                  notifications={notifications}
                  markNotificationsRead={markNotificationsRead}
                  markNotificationRead={markNotificationRead}
                  isOwner={isOwner}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/app/owner/apartments"
            element={
              user && isOwner ? (
                <OwnerApartmentsPage
                  myApartments={myApartments}
                  statusBadgeClass={statusBadgeClass}
                />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/owner/apartments/new"
            element={
              user && isOwner ? (
                <OwnerApartmentCreatePage
                  newApartment={newApartment}
                  setNewApartment={setNewApartment}
                  createApartment={createApartment}
                  contentsOptions={contentsOptions}
                />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/owner/apartments/:apartmentId"
            element={
              user && isOwner ? (
                <ApartmentDetailsPage
                  user={user}
                  token={token}
                  setFeedback={setFeedback}
                  updateApartment={updateApartment}
                  contentsOptions={contentsOptions}
                  createReservationForApartment={createReservationForApartment}
                  checkApartmentAvailability={checkApartmentAvailability}
                  defaultBackPath="/app/owner/apartments"
                />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/owner/reservations"
            element={
              user && isOwner ? (
                <OwnerReservationsPage
                  ownerReservations={ownerReservations}
                  statusBadgeClass={statusBadgeClass}
                  updateReservationStatus={updateReservationStatus}
                  ownerReservationFilters={ownerReservationFilters}
                  setOwnerReservationFilters={setOwnerReservationFilters}
                  loadOwnerReservations={loadOwnerReservations}
                />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/owner/reservations/:reservationId"
            element={
              user && isOwner ? (
                <ReservationDetailsPage
                  user={user}
                  token={token}
                  setFeedback={setFeedback}
                  statusBadgeClass={statusBadgeClass}
                  updateReservationStatus={updateReservationStatus}
                />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/owner/analytics"
            element={
              user && isOwner ? (
                <OwnerAnalyticsPage analytics={analytics} />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/admin/apartments"
            element={
              user && isAdmin ? (
                <AdminApartmentsPage
                  adminApartments={adminApartments}
                  statusBadgeClass={statusBadgeClass}
                  moderateApartment={moderateApartment}
                />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/admin/users"
            element={
              user && isAdmin ? (
                <AdminUsersPage
                  adminUsers={adminUsers}
                  deleteUser={deleteUser}
                  currentUserId={user.id}
                />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="*"
            element={<Navigate to={user ? "/app/profile" : "/"} replace />}
          />
        </Routes>
      )}
    </main>
  );
}
