import { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return useMemo(() => ({
    isLoading: isAuthLoading,
    isAuthenticated: !!user,
    fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) return null;
      return await user.getIdToken(forceRefreshToken);
    },
    user,
  }), [user, isAuthLoading]);
}