import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../supabaseClient";
import type { DailyChallenge, UserProgress } from "@/hooks/user-progress";

const API_BASE = "https://hobi-backend-yjzs.onrender.com";

const INITIAL_TIMEOUT = 20000;
const RETRY_COUNT = 2;
const RETRY_DELAY_BASE = 2000;

const KEEPALIVE_INTERVAL = 10 * 60 * 1000;

const DEFAULT_PROGRESS: UserProgress = {
  completedChallenges: 0,
  streak: 0,
  lastCompletedDate: null,
};

const fetchWithWakeup = async <T,>(
  url: string,
  config?: { timeout?: number }
): Promise<T> => {
  const timeout = config?.timeout ?? INITIAL_TIMEOUT;

  for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      attempt === 0 ? timeout : timeout * 2
    );

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error?.name === "AbortError") {
        error.code = "ECONNABORTED";
      }

      if (attempt === RETRY_COUNT) throw error;
      const delay = RETRY_DELAY_BASE * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("fetchWithWakeup: unexpected end of retries");
};

const getUserTimezoneOffset = (): number => {
  return -new Date().getTimezoneOffset() / 60;
};

interface ProgressState {
  progress: UserProgress;
  loading: boolean;
  error: string | null;
  dailyChallenge: DailyChallenge | null;
  refreshProgress: () => Promise<void>;
  refreshDailyChallenge: () => Promise<void>;
}

const ProgressContext = createContext<ProgressState | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const loadProgress = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const data = await fetchWithWakeup<any>(
        `${API_BASE}/progreso/${user.id}`
      );

      if (!mountedRef.current) return;

      setProgress({
        completedChallenges: data.completed_challenges || 0,
        streak: data.streak || 0,
        lastCompletedDate: data.last_completed_date || null,
      });
      setError(null);
    } catch (e: any) {
      if (!mountedRef.current) return;
      const msg =
        e.code === "ECONNABORTED"
          ? "El servidor está arrancando. Intenta de nuevo en unos segundos."
          : "Error al cargar progreso. Verifica tu conexión.";
      console.error("Error al cargar progreso del backend:", e.message);
      setError(msg);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadDailyChallenge = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setLoading(false);
        return;
      }

      const timezoneOffset = getUserTimezoneOffset();

      const data = await fetchWithWakeup<DailyChallenge>(
        `${API_BASE}/retos?user_timezone_offset=${timezoneOffset}&user_id=${user.id}`
      );

      if (!mountedRef.current) return;

      setDailyChallenge(data);
      setError(null);
    } catch (e: any) {
      console.error("Error al cargar reto diario:", e.message);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProgress();
    loadDailyChallenge();

    keepAliveRef.current = setInterval(() => {
      fetch(`${API_BASE}/retos`, {
        headers: { Accept: "application/json" },
      }).catch(() => {});
    }, KEEPALIVE_INTERVAL);

    return () => {
      mountedRef.current = false;
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        loading,
        error,
        dailyChallenge,
        refreshProgress: loadProgress,
        refreshDailyChallenge: loadDailyChallenge,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressState {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress debe usarse dentro de un <ProgressProvider>");
  }
  return ctx;
}