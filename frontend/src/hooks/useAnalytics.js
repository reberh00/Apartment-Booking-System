import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useAnalytics(startDate = null, endDate = null) {
  const { token } = useAuth();
  const { setFeedback } = useFeedback();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        let url = "/analytics/owner";
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (params.length > 0) url += `?${params.join("&")}`;

        const data = await api.get(url, token);
        setAnalytics(data);
      } catch (err) {
        setFeedback(err.message, true);
      }
    })();
  }, [token, startDate, endDate]);

  return { analytics };
}
