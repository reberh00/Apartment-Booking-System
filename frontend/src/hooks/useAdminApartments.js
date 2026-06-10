import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useAdminApartments() {
  const { token } = useAuth();
  const { setFeedback } = useFeedback();
  const [adminApartments, setAdminApartments] = useState([]);

  async function reload() {
    if (!token) return;
    try {
      const data = await api.get("/admin/apartments", token);
      setAdminApartments(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function moderateApartment(id, status) {
    try {
      await api.patch(`/admin/apartments/${id}/status`, { status }, token);
      setFeedback(
        `Apartman je ${status === "APPROVED" ? "odobren" : "odbijen"}.`,
      );
      await reload();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  useEffect(() => {
    void reload();
  }, [token]);

  return { adminApartments, reload, moderateApartment };
}
