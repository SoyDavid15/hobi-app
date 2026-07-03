import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import axios from 'axios';

const API_BASE = "https://hobi-backend-yjzs.onrender.com";

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

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);

  // Cargar progreso del usuario (GET) con timeout aumentado
  const loadProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 💡 Timeout de 30s para despertar al servidor de Render
      const response = await axios.get(`${API_BASE}/progreso/${user.id}`, {
        timeout: 80000 
      });
      
      setProgress({
        completedChallenges: response.data.completed_challenges || 0,
        streak: response.data.streak || 0,
        lastCompletedDate: response.data.last_completed_date || null
      });
    } catch (e: any) {
      console.error('Error al cargar progreso del backend:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar reto diario (GET) con timeout aumentado
  const loadDailyChallenge = async () => {
    try {
      // 💡 Timeout de 30s para despertar al servidor de Render
      const response = await axios.get(`${API_BASE}/retos`, {
        timeout: 30000
      });
      setDailyChallenge(response.data);
    } catch (e: any) {
      console.error('Error al cargar reto diario:', e.message);
    }
  };

  useEffect(() => {
    loadProgress();
    loadDailyChallenge();
  }, [loadProgress]);

  return {
    progress,
    loading,
    refreshProgress: loadProgress, 
    dailyChallenge,
  };
}