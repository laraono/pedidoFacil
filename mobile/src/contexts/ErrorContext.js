import React, { createContext, useState, useContext } from 'react';

const ErrorContext = createContext();

export function ErrorProvider({ children }) {
  const [errorMessage, setErrorMessage] = useState(null);

  return (
    <ErrorContext.Provider value={{ errorMessage, setErrorMessage }}>
      {children}
    </ErrorContext.Provider>
  );
}

export const useError = () => useContext(ErrorContext);