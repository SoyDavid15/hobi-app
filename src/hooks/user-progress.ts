import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import { useProgress } from "@/context/progress-provider";

export interface DailyChallenge {
  Musica: string | null;
  Lectura: string | null;
  Cine_y_Television: string | null;
  Videojuegos: string | null;
  Comida: string | null;
  Deporte: string | null;
  Salir: string | null;
  Arte: string | null;
  period?: string;
  time_remaining?: number;
  categoria_fija?: string;
  mensaje?: string;
}

export interface UserProgress {
  completedChallenges: number;
  streak: number;
  lastCompletedDate: string | null;
}

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

export function useUserProgress() {
  return useProgress();
}

export interface UserPhoto {
  url: string;
  reto: string;
  fecha: string | null;
  nombre: string;
  period?: string;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPhotos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    photos,
    loading,
    error,
    refreshPhotos: loadPhotos,
  };
}