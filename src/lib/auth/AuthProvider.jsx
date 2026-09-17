import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "@/lib/api/auth";
import { clearToken, getToken, setToken } from "@/lib/api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(getToken()));

  // Re-hydrate from the token on a hard refresh.
  useEffect(() => {
    if (!getToken()) return;

    let cancelled = false;

    getMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => clearToken())
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = ({ user: nextUser, token }) => {
    setToken(token);
    setUser(nextUser);
  };

  const signOut = () => {
    clearToken();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isSignedIn: Boolean(user),
    isAdmin: user?.role === "ADMIN",
    canCreateEvents: user?.role === "CREATOR" || user?.role === "ADMIN",
    signIn,
    signOut,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
