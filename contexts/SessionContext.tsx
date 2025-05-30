import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllSessions } from "@/services/firebase";
import { useAuth } from "@/contexts/AuthContext";

const SessionContext = createContext<{
  sessions: Session[];
  reloadSessions: () => void;
} | null>(null);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadSessions = async () => {
    try {
      const response = await getAllSessions(user?.uid || null);
      if (response)
        setSessions(
          response.filter((session): session is Session => session !== null),
        );
    } catch (err) {
      console.error("Error loading sessions:", err);
      setSessions([]);
    }
  };

  // Add user dependency to useEffect
  useEffect(() => {
    if (user) {
      // Only load sessions if there's a user
      loadSessions();
    } else {
      setSessions([]); // Clear sessions when there's no user
    }
  }, [user]); // Add user as a dependency

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
