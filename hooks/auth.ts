import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

export function useProtectedRoute(): React.ReactElement | null {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    return React.createElement(Redirect, { href: "/(auth)/login" });
  }

  return null;
}
