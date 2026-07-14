import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthHeaders } from "@/src/types/auth";
import {
  clearAuthHeaders,
  getAuthHeaders,
  saveAuthHeaders,
} from "@/src/stores/authStorage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  isLoggedIn: boolean;
  saveSession: (authHeaders: AuthHeaders) => Promise<void>;
  clearSession: () => Promise<void>;
};

const STARTUP_LOADING_DURATION_MS = 1000;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const [authHeaders] = await Promise.all([
        getAuthHeaders(),
        wait(STARTUP_LOADING_DURATION_MS),
      ]);

      if (!isMounted) return;

      setStatus(authHeaders ? "authenticated" : "unauthenticated");
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isLoggedIn: status === "authenticated",
      async saveSession(authHeaders) {
        await saveAuthHeaders(authHeaders);
        setStatus("authenticated");
      },
      async clearSession() {
        await clearAuthHeaders();
        setStatus("unauthenticated");
      },
    }),
    [status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function wait(durationMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

export function useAuthStore() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuthStore must be used within AuthProvider");
  }

  return authContext;
}
