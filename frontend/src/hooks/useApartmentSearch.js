import { useEffect, useState } from "react";
import { api } from "../api";
import { defaultSearch } from "../constants/forms";
import { useFeedback } from "../context/FeedbackContext";

export function useApartmentSearch() {
  const { setFeedback } = useFeedback();
  const [search, setSearch] = useState(defaultSearch);
  const [apartmentsResult, setApartmentsResult] = useState({
    apartments: [],
    total: 0,
  });

  async function loadApartments() {
    try {
      const params = new URLSearchParams();
      Object.entries(search).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length) params.set(key, value.join(","));
        } else if (value) {
          params.set(key, value);
        }
      });
      const data = await api.get(`/apartments?${params.toString()}`);
      setApartmentsResult(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  useEffect(() => {
    void loadApartments();
  }, []);

  return { search, setSearch, apartmentsResult, loadApartments };
}
