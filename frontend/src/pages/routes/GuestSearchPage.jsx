import PublicSearchSection from '../../components/sections/PublicSearchSection';

export default function GuestSearchPage({ search, setSearch, loadApartments, apartmentsResult }) {
  return (
    <PublicSearchSection
      search={search}
      setSearch={setSearch}
      loadApartments={loadApartments}
      apartmentsResult={apartmentsResult}
    />
  );
}
