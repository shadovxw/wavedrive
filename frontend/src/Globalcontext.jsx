// src/context/GlobalContext.js
import React, { createContext, useState } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <GlobalContext.Provider value={{ activeIndex, setActiveIndex }}>
      {children}
    </GlobalContext.Provider>
  );
};
