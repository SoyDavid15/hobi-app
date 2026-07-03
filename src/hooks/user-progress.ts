import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../supabaseClient";
import axios from "axios";

const API_BASE = "https://hobi-backend-yjzs.onrender.com";

const INITIAL_TIMEOUT = 20000;
const RETRY_COUNT = 2;
const RETRY_DELAY_BASE = 2000;

const fetchWithWakeup = async <T,>(
  url: string,
  config?: { timeout?: number }
): Promise<T> => {
  const timeout = config?.timeout ?? INITIAL_TIMEOUT;

  for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
    try {
      const response = await axios.get<T>(url, {
        timeout: attempt === 0 ? timeout : timeout * 2,
      });
      return response.data;
    } catch (error: any) {
      if (attempt === RETRY_COUNT) throw error;
      const delay = RETRY_DELAY_BASE * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("fetchWithWakeup: unexpected end of retries");
};

export interface DailyChallenge {
  Musica: string | null;
  Lectura: string | null;
  Cine_y_Television: string | null;
  Videojuegos: string | null;
  Comida: string | null;
  Deporte: string | null;
  Salir: string | null;
  Arte: string | null;
}

export interface UserProgress {
  completedChallenges: number;
  streak: number;
  lastCompletedDate: string | null;
}

const DEFAULT_PROGRESS: UserProgress = {
  completedChallenges: 0,
  streak: 0,
  lastCompletedDate: null,
};

const KEEPALIVE_INTERVAL = 10 * 60 * 1000;

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

      setProgress({
        completedChallenges: data.completed_challenges || 0,
        streak: data.streak || 0,
        lastCompletedDate: data.last_completed_date || null,
      });
      setError(null);
    } catch (e: any) {
      const msg =
        e.code === "ECONNABORTED"
          ? "El servidor está arrancando. Intenta de nuevo en unos segundos."
          : "Error al cargar progreso. Verifica tu conexión.";
      console.error("Error al cargar progreso del backend:", e.message);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDailyChallenge = async () => {
    try {
      const data = await fetchWithWakeup<DailyChallenge>(`${API_BASE}/retos`);
      setDailyChallenge(data);
      setError(null);
    } catch (e: any) {
      console.error("Error al cargar reto diario:", e.message);
    }
  };

  useEffect(() => {
    loadProgress();
    loadDailyChallenge();

    keepAliveRef.current = setInterval(() => {
      axios
        .get(`${API_BASE}/retos`, { timeout: 8000 })
        .catch(() => {});
    }, KEEPALIVE_INTERVAL);

    return () => {
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
    };
  }, [loadProgress]);

  return {
    progress,
    loading,
    error,
    refreshProgress: loadProgress,
    dailyChallenge,
  };
}

export interface UserPhoto {
  url: string;
  reto: string;
  fecha: string | null;
  nombre: string;
}

export interface UserPhotosResponse {
  user_id: string;
  total_fotos: number;
  fotos: UserPhoto[];
}

export function useUserPhotos() {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const data = await fetchWithWakeup<UserPhotosResponse>(
        `${API_BASE}/usuarios/${user.id}/fotos`
      );

      setPhotos(data.fotos);
      setError(null);
    } catch (e: any) {
      const msg =
        e.code === "ECONNABORTED"
          ? "El servidor está arrancando. Intenta de nuevo en unos segundos."
          : "Error al cargar fotos. Verifica tu conexión.";
      console.error("Error al cargar fotos del backend:", e.message);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return {
    photos,
    loading,
    error,
    refreshPhotos: loadPhotos,
  };
}