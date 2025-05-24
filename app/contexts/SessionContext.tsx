import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllSessions } from "@/app/services/firebase";

const SessionContext = createContext<{
  sessions: Session[];
  reloadSessions: () => void;
} | null>(null);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadSessions = async () => {
    try {
      const response = await getAllSessions();
      if (response)
        setSessions(
          response.filter((session): session is Session => session !== null),
        );
    } catch (err) {
      console.error("Error loading sessions:", err);
      setSessions([]);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <SessionContext.Provider value={{ sessions, reloadSessions: loadSessions }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
};
