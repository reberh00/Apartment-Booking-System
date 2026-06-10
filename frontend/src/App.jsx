import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useFeedback } from "./context/FeedbackContext";
import { useNotifications } from "./context/NotificationsContext";
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
  const { user, authReady, isOwner, isAdmin } = useAuth();
  const { error, notice } = useFeedback();
  const { unreadCount } = useNotifications();

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
                {unreadCount > 0 ? (
                  <span className="badge badge-warn notif-bubble">
                    {unreadCount}
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
              user ? <Navigate to="/app/profile" replace /> : <PublicPage />
            }
          />

          <Route
            path="/app/search"
            element={user ? <GuestSearchPage /> : <Navigate to="/" replace />}
          />

          <Route
            path="/apartments/:apartmentId"
            element={
              <ApartmentDetailsPage
                defaultBackPath={user ? "/app/search" : "/"}
              />
            }
          />

          <Route
            path="/app/apartments/:apartmentId"
            element={
              user ? (
                <ApartmentDetailsPage defaultBackPath="/app/search" />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/app/profile"
            element={user ? <ProfilePage /> : <Navigate to="/" replace />}
          />

          <Route
            path="/app/reservations/my"
            element={
              user ? <GuestReservationsPage /> : <Navigate to="/" replace />
            }
          />

          <Route
            path="/app/reservations/:reservationId"
            element={
              user ? <ReservationDetailsPage /> : <Navigate to="/" replace />
            }
          />

          <Route
            path="/app/notifications"
            element={user ? <NotificationsPage /> : <Navigate to="/" replace />}
          />

          <Route
            path="/app/owner/apartments"
            element={
              user && isOwner ? (
                <OwnerApartmentsPage />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/owner/apartments/new"
            element={
              user && isOwner ? (
                <OwnerApartmentCreatePage />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/owner/apartments/:apartmentId"
            element={
              user && isOwner ? (
                <ApartmentDetailsPage defaultBackPath="/app/owner/apartments" />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/owner/reservations"
            element={
              user && isOwner ? (
                <OwnerReservationsPage />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/owner/reservations/:reservationId"
            element={
              user && isOwner ? (
                <ReservationDetailsPage />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/owner/analytics"
            element={
              user && isOwner ? (
                <OwnerAnalyticsPage />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/admin/apartments"
            element={
              user && isAdmin ? (
                <AdminApartmentsPage />
              ) : (
                <Navigate to="/app/profile" replace />
              )
            }
          />

          <Route
            path="/app/admin/users"
            element={
              user && isAdmin ? (
                <AdminUsersPage />
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
