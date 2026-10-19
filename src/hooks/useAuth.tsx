import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { MERCHANT_SESSION_TTL_MS } from "@/config/session";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    signupData?: Record<string, unknown>,
  ) => Promise<{ error: any }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_STARTED_AT_KEY = "merchant_session_started_at";

const getSessionStartedAt = () => {
  const storedValue = window.localStorage.getItem(SESSION_STARTED_AT_KEY);
  const parsedValue = Number(storedValue);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

const storeSessionStartedAt = (timestamp: number) => {
  window.localStorage.setItem(SESSION_STARTED_AT_KEY, String(timestamp));
};

const clearSessionStartedAt = () => {
  window.localStorage.removeItem(SESSION_STARTED_AT_KEY);
};

const ensureSessionStartedAt = () => {
  const existingTimestamp = getSessionStartedAt();

  if (existingTimestamp) {
    return existingTimestamp;
  }

  const now = Date.now();
  storeSessionStartedAt(now);
  return now;
};

const isSessionExpired = (startedAt: number) =>
  Date.now() - startedAt >= MERCHANT_SESSION_TTL_MS;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncSessionState = async (nextSession: Session | null) => {
      if (!nextSession) {
        clearSessionStartedAt();
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      const startedAt = ensureSessionStartedAt();

      if (isSessionExpired(startedAt)) {
        clearSessionStartedAt();
        await supabase.auth.signOut();
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!isMounted) return;

      setSession((prevSession) => {
        if (!nextSession && !prevSession) return null;
        if (
          prevSession &&
          nextSession &&
          prevSession.access_token === nextSession.access_token &&
          prevSession.user?.id === nextSession.user?.id
        ) {
          return prevSession;
        }
        return nextSession;
      });

      setUser((prevUser) => {
        if (!nextSession?.user && !prevUser) return null;
        if (
          prevUser &&
          nextSession?.user &&
          prevUser.id === nextSession.user.id &&
          prevUser.updated_at === nextSession.user.updated_at
        ) {
          return prevUser;
        }
        return nextSession?.user ?? null;
      });

      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_IN" && nextSession) {
        storeSessionStartedAt(Date.now());
      }

      if (event === "SIGNED_OUT") {
        clearSessionStartedAt();
      }

      void syncSessionState(nextSession);
    });

    void supabase.auth
      .getSession()
      .then(({ data: { session: nextSession } }) => {
        void syncSessionState(nextSession);
      });

    const intervalId = window.setInterval(() => {
      void supabase.auth
        .getSession()
        .then(({ data: { session: nextSession } }) => {
          void syncSessionState(nextSession);
        });
    }, 60_000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.clearInterval(intervalId);
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    signupData?: Record<string, unknown>,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: signupData,
      },
    });
    return { error };
  };

  const signIn = async (
    email: string,
    password: string,
  ) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.session) {
      storeSessionStartedAt(Date.now());
    }

    return { error };
  };

  const signOut = async () => {
    clearSessionStartedAt();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
