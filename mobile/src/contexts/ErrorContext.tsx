import React, { createContext, useState, useContext } from 'react';

interface ErrorContextType {
  errorMessage: string | null
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>
}

const ErrorContext = createContext<ErrorContextType>({} as ErrorContextType);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <ErrorContext.Provider value={{ errorMessage, setErrorMessage }}>
      {children}
    </ErrorContext.Provider>
  );
}

export const useError = () => useContext(ErrorContext);
