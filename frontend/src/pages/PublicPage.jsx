import PublicSearchSection from "../components/PublicSearchSection";
import { useApartmentSearch } from "../hooks/useApartmentSearch";
import { useAuthForm } from "../hooks/useAuthForm";

export default function PublicPage() {
  const { search, setSearch, apartmentsResult, loadApartments } =
    useApartmentSearch();
  const { authMode, setAuthMode, authForm, setAuthForm, submitAuth } =
    useAuthForm();

  return (
    <>
      <section className="card">
        <h2>{authMode === "login" ? "Prijava" : "Registracija"}</h2>
        <form onSubmit={submitAuth} className="grid grid-2">
          <label>
            Email
            <input
              value={authForm.email}
              onChange={(e) =>
                setAuthForm((p) => ({ ...p, email: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Lozinka
            <input
              type="password"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm((p) => ({ ...p, password: e.target.value }))
              }
              required
            />
          </label>
          {authMode === "register" ? (
            <>
              <label>
                Ime
                <input
                  value={authForm.firstName}
                  onChange={(e) =>
                    setAuthForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Prezime
                <input
                  value={authForm.lastName}
                  onChange={(e) =>
                    setAuthForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Uloga
                <select
                  value={authForm.role}
                  onChange={(e) =>
                    setAuthForm((p) => ({ ...p, role: e.target.value }))
                  }
                >
                  <option value="GUEST">GUEST</option>
                  <option value="OWNER">OWNER</option>
                </select>
              </label>
              <label>
                Telefon
                <input
                  value={authForm.phone}
                  onChange={(e) =>
                    setAuthForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </label>
            </>
          ) : null}
          <button type="submit">
            {authMode === "login" ? "Prijavi se" : "Registriraj se"}
          </button>
        </form>
        <button
          className="ghost"
          onClick={() =>
            setAuthMode((m) => (m === "login" ? "register" : "login"))
          }
        >
          {authMode === "login"
            ? "Nemate račun? Registracija"
            : "Već imate račun? Prijava"}
        </button>
      </section>
      <PublicSearchSection
        search={search}
        setSearch={setSearch}
        loadApartments={loadApartments}
        apartmentsResult={apartmentsResult}
      />
    </>
  );
}
