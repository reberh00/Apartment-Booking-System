import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';
import { useFeedback } from './FeedbackContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { setFeedback } = useFeedback();
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!token);

  const isOwner = user?.role === 'OWNER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!token) {
      setUser(null);
      setAuthReady(true);
      return;
    }
    setAuthReady(false);
    void loadMe().finally(() => setAuthReady(true));
  }, [token]);

  async function loadMe() {
    try {
      const current = await api.get('/auth/me', token);
      setUser(current);
    } catch (err) {
      logout();
      setFeedback(err.message, true);
    }
  }

  function login(data) {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setFeedback('Odjavljeni ste.');
  }

  const value = {
    token,
    user,
    authReady,
    isOwner,
    isAdmin,
    setUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
