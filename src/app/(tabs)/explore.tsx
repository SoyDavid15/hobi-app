import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HobiCharacter } from '@/components/hobi-character';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '../../../supabaseClient';
import { useUserProgress } from '@/hooks/user-progress';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  
  const { progress } = useUserProgress(); 
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || 'Usuario');
      setUsername(user?.user_metadata?.displayName || user?.email?.split('@')[0] || 'Usuario');
    }
    loadUser();
  }, []);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  return (
    <ThemedView style={styles.container} type="backgroundElement">
      <ScrollView
        style={styles.scrollView}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top || Spacing.six }]}
      >
        <View style={styles.innerContainer}>
          
          {/* Encabezado del Perfil */}
          <View style={styles.headerContainer}>
            <Pressable style={styles.menuButton} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={28} color="#4f4f4f" />
            </Pressable>
            <View style={styles.profileContent}>
              <View style={styles.avatarContainer}>
                <HobiCharacter />
              </View>
              <ThemedText type="subtitle" style={styles.username}>
                {username || 'Cargando...'}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.email}>
                {userEmail || 'Buscando perfil...'}
              </ThemedText>
            </View>
          </View>

          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            
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

          </View>

          {/* Sección de Historial / Motivación */}
          <ThemedView type="backgroundElement" style={styles.motivationContainer}>
            <ThemedText type="defaultSemiBold" style={styles.motivationTitle}>
              ¡Sigue así!
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.motivationText}>
              Completar retos diarios te ayuda a descubrir nuevos pasatiempos y mejorar tu bienestar. 
              Vuelve mañana para continuar tu racha de {progress.streak} días.
            </ThemedText>
          </ThemedView>

</View>
       </ScrollView>
     </ThemedView>
   );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.six,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.six,
    marginTop: Spacing.four,
    position: 'relative',
    paddingTop: Spacing.two,
  },
  menuButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: Spacing.two,
    zIndex: 10,
  },
  profileContent: {
    alignItems: 'center',
    marginTop: Spacing.three,
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
    elevation: 2,
    shadowColor: '#000',
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
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: '#dcdde1',
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