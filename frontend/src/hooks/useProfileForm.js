import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useProfileForm() {
  const { user, token, setUser } = useAuth();
  const { setFeedback } = useFeedback();
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      avatarUrl: user.avatarUrl || "",
    });
  }, [user]);

  async function updateProfile(e) {
    e.preventDefault();
    try {
      const updated = await api.patch("/users/me", profileForm, token);
      setUser(updated);
      setFeedback("Profil je ažuriran.");
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  return { profileForm, setProfileForm, updateProfile };
}
