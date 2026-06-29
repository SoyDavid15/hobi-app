import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../../../supabaseClient';
import Home from "@/components/home"; 
import { useUserProgress } from '@/hooks/user-progress';
import { useChallengeNotification } from '../../../notifications';

export default function HomeScreen() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Consumo del progreso del usuario
  const { dailyChallenge } = useUserProgress();
  
  // Ejecución del hook seguro contra crasheos
  useChallengeNotification(dailyChallenge);

  useEffect(() => {
    // 1. Verificamos la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchamos cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return session ? <Home /> : <Redirect href="/login" />;
}