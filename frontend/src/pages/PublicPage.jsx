import AuthSection from '../components/sections/AuthSection';
import PublicSearchSection from '../components/sections/PublicSearchSection';

export default function PublicPage(props) {
  const {
    search,
    setSearch,
    loadApartments,
    apartmentsResult,
    authMode,
    setAuthMode,
    authForm,
    setAuthForm,
    submitAuth,
  } = props;

  return (
    <>
      <PublicSearchSection
        search={search}
        setSearch={setSearch}
        loadApartments={loadApartments}
        apartmentsResult={apartmentsResult}
      />
      <AuthSection
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        submitAuth={submitAuth}
      />
    </>
  );
}
