import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useContents(apartmentId) {
  const { token } = useAuth();
  const { setFeedback } = useFeedback();
  const [contentsOptions, setContentsOptions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const path = apartmentId
          ? `/contents?apartmentId=${encodeURIComponent(apartmentId)}`
          : "/contents";
        const data = await api.get(path);
        setContentsOptions(data);
      } catch (err) {
        setFeedback(err.message, true);
      }
    })();
  }, [apartmentId, setFeedback]);

  async function createContent(name, icon) {
    const created = await api.post(
      "/contents",
      {
        name,
        ...(icon ? { icon } : {}),
        ...(apartmentId ? { apartmentId } : {}),
      },
      token,
    );
    setContentsOptions((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return created;
  }

  async function deleteContent(id) {
    await api.del(`/contents/${id}`, token);
    setContentsOptions((prev) => prev.filter((c) => c.id !== id));
  }

  return { contentsOptions, createContent, deleteContent };
}
