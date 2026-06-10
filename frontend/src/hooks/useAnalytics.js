import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useAnalytics() {
  const { token } = useAuth();
  const { setFeedback } = useFeedback();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await api.get("/analytics/owner", token);
        setAnalytics(data);
      } catch (err) {
        setFeedback(err.message, true);
      }
    })();
  }, [token]);

  return { analytics };
}
