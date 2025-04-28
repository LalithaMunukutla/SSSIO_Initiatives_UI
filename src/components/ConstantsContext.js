import React, { createContext, useState, useEffect } from "react";

export const ConstantsContext = createContext();

export const ConstantsProvider = ({ children }) => {
  const [constants, setConstants] = useState({
    activities: [],
    zones: [],
    regions: [],
    countries: [],
    questionTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConstants = async () => {
      try {
        const response = await fetch("/api/constants");
        if (!response.ok) {
          throw new Error("Failed to fetch constants");
        }
        const data = await response.json();
        setConstants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConstants();
  }, []);

  return (
    <ConstantsContext.Provider value={{ constants, loading, error }}>
      {children}
    </ConstantsContext.Provider>
  );
};