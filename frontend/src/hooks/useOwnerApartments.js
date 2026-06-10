import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useOwnerApartments() {
  const { token } = useAuth();
  const { setFeedback } = useFeedback();
  const [myApartments, setMyApartments] = useState([]);

  async function reload() {
    if (!token) return;
    try {
      const data = await api.get("/apartments/owner/mine", token);
      setMyApartments(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  useEffect(() => {
    void reload();
  }, [token]);

  return { myApartments, reload };
}
