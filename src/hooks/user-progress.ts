import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const API_BASE = "https://hobi-backend-yjzs.onrender.com";
// O si estás probando en local:
// const API_BASE = "http://192.168.x.x:8000"; 
// (Asegúrate de reemplazarlo si tu backend corre en tu máquina y no en onrender)

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

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/progreso/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProgress({
          completedChallenges: data.completed_challenges,
          streak: data.streak,
          lastCompletedDate: data.last_completed_date
        });
      }
    } catch (e) {
      console.error('Failed to load progress from backend', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const addChallenge = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`${API_BASE}/retos/realizado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id })
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(prev => ({
          ...prev,
          completedChallenges: data.completed_challenges,
          streak: data.streak,
          lastCompletedDate: new Date().toISOString()
        }));
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (e) {
      console.error('Failed to save progress to backend', e);
      throw e; // Propagar el error para que challenge-card muestre la alerta si falla
    }
  }, []);

  return {
    progress,
    loading,
    addChallenge,
    refreshProgress: loadProgress,
  };
}
