import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useOwnerReservations() {
  const { token } = useAuth();
  const { setFeedback } = useFeedback();
  const [ownerReservations, setOwnerReservations] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    checkIn: "",
    checkOut: "",
  });

  async function reload() {
    if (!token) return;
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
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

  async function updateReservationStatus(id, status) {
    try {
      await api.patch(`/reservations/${id}/status`, { status }, token);
      setFeedback("Status rezervacije je promijenjen.");
      await reload();
    } catch (err) {
      setFeedback(err.message, true);
      throw err;
    }
  }

  useEffect(() => {
    void reload();
  }, [token]);

  return {
    ownerReservations,
    filters,
    setFilters,
    reload,
    updateReservationStatus,
  };
}
