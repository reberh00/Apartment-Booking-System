import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useAuthForm() {
  const { login } = useAuth();
  const { setFeedback } = useFeedback();
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "GUEST",
    phone: "",
  });

  async function submitAuth(e) {
    e.preventDefault();
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        authMode === "login"
          ? { email: authForm.email, password: authForm.password }
          : authForm;

      const data = await api.post(endpoint, payload);
      login(data);
      setFeedback("Uspješno ste prijavljeni.");
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  return { authMode, setAuthMode, authForm, setAuthForm, submitAuth };
}
