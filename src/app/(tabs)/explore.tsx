import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HobiCharacter } from '@/components/hobi-character';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '../../../supabaseClient';
import { useUserProgress } from '@/hooks/user-progress';

export default function ProfileScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  
  // Ya no necesitamos progressLoading para bloquear la pantalla
  const { progress } = useUserProgress(); 
  
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || 'Usuario');
    }
    loadUser();
  }, []);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top || Spacing.six }]}
    >
      <ThemedView style={styles.container}>
        
        {/* Encabezado del Perfil */}
        <ThemedView style={styles.headerContainer}>
          <View style={styles.avatarContainer}>
            <HobiCharacter />
          </View>
          <ThemedText type="subtitle" style={styles.username}>
            {userEmail ? userEmail.split('@')[0] : 'Cargando...'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.email}>
            {userEmail || 'Buscando perfil...'}
          </ThemedText>
        </ThemedView>

        {/* Estadísticas */}
        <ThemedView style={styles.statsContainer}>
          
          <ThemedView type="backgroundElement" style={styles.statCard}>
            <Ionicons name="flame" size={32} color="#FF6B6B" />
            <ThemedText type="subtitle" style={styles.statValue}>
              {progress.streak}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              Días de Racha
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            <ThemedText type="subtitle" style={styles.statValue}>
              {progress.completedChallenges}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              Retos Hechos
            </ThemedText>
          </ThemedView>

        </ThemedView>

        {/* Sección de Historial / Motivación */}
        <ThemedView style={styles.motivationContainer}>
          <ThemedText type="defaultSemiBold" style={styles.motivationTitle}>
            ¡Sigue así!
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.motivationText}>
            Completar retos diarios te ayuda a descubrir nuevos pasatiempos y mejorar tu bienestar. 
            Vuelve mañana para continuar tu racha de {progress.streak} días.
          </ThemedText>
        </ThemedView>

      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.six,
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.six,
    marginTop: Spacing.four,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    overflow: 'hidden',
  },
  username: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  email: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginBottom: Spacing.six,
  },
  statCard: {
    flex: 1,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 28,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  statLabel: {
    textAlign: 'center',
  },
  motivationContainer: {
    padding: Spacing.five,
    backgroundColor: 'rgba(0, 85, 218, 0.05)',
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(0, 85, 218, 0.1)',
  },
  motivationTitle: {
    fontSize: 18,
    marginBottom: Spacing.two,
    color: '#0055DA',
  },
  motivationText: {
    lineHeight: 22,
  },
});
