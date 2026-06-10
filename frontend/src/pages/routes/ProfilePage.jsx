import { useAuth } from "../../context/AuthContext";
import { useProfileForm } from "../../hooks/useProfileForm";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { profileForm, setProfileForm, updateProfile } = useProfileForm();

  return (
    <section className="card">
      <div className="row between">
        <h2>Korisnički profil ({user.role})</h2>
        <button onClick={logout}>Odjava</button>
      </div>
      <form onSubmit={updateProfile} className="grid grid-2">
        <label>
          Ime
          <input
            value={profileForm.firstName}
            onChange={(e) =>
              setProfileForm((p) => ({ ...p, firstName: e.target.value }))
            }
          />
        </label>
        <label>
          Prezime
          <input
            value={profileForm.lastName}
            onChange={(e) =>
              setProfileForm((p) => ({ ...p, lastName: e.target.value }))
            }
          />
        </label>
        <label>
          Telefon
          <input
            value={profileForm.phone}
            onChange={(e) =>
              setProfileForm((p) => ({ ...p, phone: e.target.value }))
            }
          />
        </label>
        <label>
          Avatar URL
          <input
            value={profileForm.avatarUrl}
            onChange={(e) =>
              setProfileForm((p) => ({ ...p, avatarUrl: e.target.value }))
            }
          />
        </label>
        <button type="submit">Spremi profil</button>
      </form>
    </section>
  );
}
