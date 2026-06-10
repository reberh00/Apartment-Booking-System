import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useAdminUsers() {
  const { token } = useAuth();
  const { setFeedback } = useFeedback();
  const [adminUsers, setAdminUsers] = useState([]);

  async function reload() {
    if (!token) return;
    try {
      const data = await api.get("/admin/users", token);
      setAdminUsers(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function deleteUser(id) {
    try {
      await api.del(`/admin/users/${id}`, token);
      setFeedback("Korisnik je obrisan.");
      await reload();
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  useEffect(() => {
    void reload();
  }, [token]);

  return { adminUsers, reload, deleteUser };
}
