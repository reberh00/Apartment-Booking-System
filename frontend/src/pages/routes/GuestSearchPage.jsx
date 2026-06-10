import PublicSearchSection from "../../components/PublicSearchSection";
import { useApartmentSearch } from "../../hooks/useApartmentSearch";

export default function GuestSearchPage() {
  const { search, setSearch, apartmentsResult, loadApartments } =
    useApartmentSearch();
  return (
    <PublicSearchSection
      search={search}
      setSearch={setSearch}
      loadApartments={loadApartments}
      apartmentsResult={apartmentsResult}
    />
  );
}
