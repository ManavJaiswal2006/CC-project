"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ProfessionalModeContextType {
  isProfessionalMode: boolean;
  toggleProfessionalMode: () => void;
  setProfessionalMode: (value: boolean) => void;
}

const ProfessionalModeContext = createContext<ProfessionalModeContextType>({
  isProfessionalMode: false,
  toggleProfessionalMode: () => {},
  setProfessionalMode: () => {},
});

const STORAGE_KEY = "cc-project_professional_mode";

export const ProfessionalModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isProfessionalMode, setIsProfessionalMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") {
      setIsProfessionalMode(true);
    }
  }, []);

  const toggleProfessionalMode = () => {
    setIsProfessionalMode((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, newValue.toString());
      return newValue;
    });
  };

  const setProfessionalMode = (value: boolean) => {
    setIsProfessionalMode(value);
    localStorage.setItem(STORAGE_KEY, value.toString());
  };

  return (
    <ProfessionalModeContext.Provider
      value={{
        isProfessionalMode,
        toggleProfessionalMode,
        setProfessionalMode,
      }}
    >
      {children}
    </ProfessionalModeContext.Provider>
  );
};

export const useProfessionalMode = () => useContext(ProfessionalModeContext);

