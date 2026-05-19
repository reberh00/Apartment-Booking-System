import ProfileSection from '../../components/sections/ProfileSection';

export default function ProfilePage({ user, profileForm, setProfileForm, updateProfile, logout }) {
  return (
    <ProfileSection
      user={user}
      profileForm={profileForm}
      setProfileForm={setProfileForm}
      updateProfile={updateProfile}
      logout={logout}
    />
  );
}
