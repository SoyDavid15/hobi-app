import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../supabaseClient";

interface AuthState {
  session: Session | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (!mountedRef.current) return;
      if (sessionError) {
        console.error("Error al obtener sesión inicial:", sessionError.message);
        setError("Error de autenticación");
      }
      setSession(session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return;
      setSession(session ?? null);
      setError(null);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const {
        data: { session },
        error: refreshError,
      } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      if (refreshError) {
        setError("Error al refrescar sesión");
        return;
      }
      setSession(session ?? null);
      setError(null);
    } catch (e: any) {
      console.error("Error en refresh de sesión:", e.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setError(null);
    } catch (e: any) {
      console.error("Error al cerrar sesión:", e.message);
      setError("Error al cerrar sesión");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, error, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return ctx;
}

export function useAuthSession(): Session | null {
  const { session } = useAuth();
  return session;
}