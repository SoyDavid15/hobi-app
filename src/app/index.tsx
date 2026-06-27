import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../../supabaseClient';
import Home from "@/components/home"; // Tu componente de inicio

export default function HomeScreen() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Revisamos si ya hay una sesión al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchamos cambios en la autenticación (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mientras verificamos la sesión, mostramos un loader
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Si NO hay sesión, enviamos al usuario al login
  if (!session) {
    return <Redirect href="/login" />;
  }

  // Si SÍ hay sesión, mostramos la pantalla de inicio
  return <Home />;
}