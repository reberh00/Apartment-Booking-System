import { useEffect, useState } from "react";
import { api } from "../api";
import { useFeedback } from "../context/FeedbackContext";

export function useContents() {
  const { setFeedback } = useFeedback();
  const [contentsOptions, setContentsOptions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/contents");
        setContentsOptions(data);
      } catch (err) {
        setFeedback(err.message, true);
      }
    })();
  }, []);

  return { contentsOptions };
}
