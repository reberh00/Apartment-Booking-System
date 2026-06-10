import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useGuestReservations() {
  const { token } = useAuth();
  const { setFeedback } = useFeedback();
  const [guestReservations, setGuestReservations] = useState([]);

  async function reload() {
    if (!token) return;
    try {
      const data = await api.get("/reservations/my", token);
      setGuestReservations(data);
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

  return { guestReservations, reload, updateReservationStatus };
}
