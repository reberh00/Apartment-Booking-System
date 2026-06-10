import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';
import { useFeedback } from './FeedbackContext';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { token } = useAuth();
  const { setFeedback } = useFeedback();
  const [notifications, setNotifications] = useState([]);

  const unreadCount = useMemo(
    () => notifications.reduce((count, notification) => (notification.isRead ? count : count + 1), 0),
    [notifications],
  );

  async function reload() {
    if (!token) return;
    try {
      const data = await api.get('/notifications', token);
      setNotifications(data);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all', {}, token);
      setFeedback('Obavijesti su označene kao pročitane.');
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`, {}, token);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification,
        ),
      );
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  useEffect(() => {
    void reload();
  }, [token]);

  const value = { notifications, unreadCount, reload, markAllRead, markRead };

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
