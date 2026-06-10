import { createContext, useContext, useState } from 'react';

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function setFeedback(message, isError = false) {
    if (isError) {
      setError(message);
      setNotice('');
      return;
    }
    setNotice(message);
    setError('');
  }

  return (
    <FeedbackContext.Provider value={{ error, notice, setFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  return useContext(FeedbackContext);
}
