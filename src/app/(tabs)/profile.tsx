import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { HobiCharacter } from '@/components/hobi-character';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '../../../supabaseClient';
import { useUserProgress, useUserPhotos } from '@/hooks/user-progress';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  
  const { progress } = useUserProgress();
  const { photos, loading: photosLoading, error: photosError } = useUserPhotos();
  
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

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top || Spacing.six }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>
          
          <View style={styles.headerContainer}>
            <Pressable style={styles.menuButton} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={26} color={theme.text} />
            </Pressable>
            
            <View style={styles.profileContent}>
              <View style={[styles.avatarContainer, { backgroundColor: theme.backgroundElement }]}>
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

          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FFF0F0' }]}>
                <Ionicons name="flame" size={26} color="#FF6B6B" />
              </View>
              <ThemedText type="subtitle" style={styles.statValue}>
                {progress?.streak ?? 0}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
                Días de Racha
              </ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <View style={[styles.iconWrapper, { backgroundColor: '#EAFCEB' }]}>
                <Ionicons name="checkmark-circle" size={26} color="#4CAF50" />
              </View>
              <ThemedText type="subtitle" style={styles.statValue}>
                {progress?.completedChallenges ?? 0}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
                Retos Hechos
              </ThemedText>
            </View>
          </View>

          <View style={[styles.motivationContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <ThemedText type="defaultSemiBold" style={styles.motivationTitle}>
              ¡Sigue así, {username || 'Hobi'}!
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.motivationText}>
              Completar retos diarios te ayuda a descubrir nuevos pasatiempos y mejorar tu bienestar. 
              Vuelve mañana para continuar tu racha de {progress?.streak ?? 0} días.
            </ThemedText>
          </View>

          <View style={[styles.galleryContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <ThemedText type="defaultSemiBold" style={styles.galleryTitle}>
              Tus Retos Completados
            </ThemedText>

            {photosLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.textSecondary} />
                <ThemedText themeColor="textSecondary" style={styles.loadingText}>
                  Cargando fotos...
                </ThemedText>
              </View>
            ) : photosError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="cloud-offline-outline" size={48} color={theme.textSecondary} />
                <ThemedText themeColor="textSecondary" style={styles.errorText}>
                  {photosError}
                </ThemedText>
              </View>
            ) : photos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="camera-outline" size={48} color={theme.textSecondary} />
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  Aún no has completado ningún reto. ¡Empieza hoy!
                </ThemedText>
              </View>
            ) : (
              <View style={styles.photosList}>
                {photos.map((photo, index) => (
                  <View key={index} style={[styles.photoCard, { borderColor: theme.border }]}>
                    <Image
                      source={{ uri: photo.url }}
                      style={styles.photoImage}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.photoInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.photoReto}>
                        {photo.reto}
                      </ThemedText>
                      <ThemedText themeColor="textSecondary" style={styles.photoFecha}>
                        {formatDate(photo.fecha)}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: Spacing.six },
  container: { flex: 1 },
  innerContainer: { maxWidth: MaxContentWidth, flexGrow: 1, paddingHorizontal: Spacing.five },
  headerContainer: { alignItems: 'center', marginBottom: Spacing.five, marginTop: Spacing.two, position: 'relative', paddingTop: Spacing.two },
  menuButton: { position: 'absolute', top: 0, right: 0, padding: Spacing.two, zIndex: 10 },
  profileContent: { alignItems: 'center', marginTop: Spacing.four },
  avatarContainer: { width: 130, height: 130, borderRadius: 65, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.four, overflow: 'hidden', borderWidth: 4, borderColor: '#0055DA20' },
  username: { fontSize: 26, fontWeight: '700', marginBottom: Spacing.one },
  email: { fontSize: 14, opacity: 0.8 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.four, marginBottom: Spacing.five },
  statCard: { flex: 1, paddingVertical: Spacing.five, paddingHorizontal: Spacing.four, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, elevation: 2 },
  iconWrapper: { padding: Spacing.two, borderRadius: 14, marginBottom: Spacing.two },
  statValue: { fontSize: 28, fontWeight: 'bold', marginBottom: Spacing.one },
  statLabel: { fontSize: 13, textAlign: 'center' },
  motivationContainer: { padding: Spacing.five, borderRadius: 20, borderWidth: 1 },
  motivationTitle: { fontSize: 18, marginBottom: Spacing.two, color: '#0055DA' },
  motivationText: { lineHeight: 22, fontSize: 14 },
  galleryContainer: { padding: Spacing.five, borderRadius: 20, borderWidth: 1, marginTop: Spacing.five },
  galleryTitle: { fontSize: 18, marginBottom: Spacing.four, color: '#0055DA', textAlign: 'center' },
  loadingContainer: { alignItems: 'center', paddingVertical: Spacing.four },
  loadingText: { marginTop: Spacing.two, fontSize: 14 },
  errorContainer: { alignItems: 'center', paddingVertical: Spacing.four },
  errorText: { marginTop: Spacing.two, fontSize: 14, textAlign: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing.four },
  emptyText: { marginTop: Spacing.two, fontSize: 14, textAlign: 'center' },
  photosList: { gap: Spacing.three },
  photoCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  photoImage: { width: '100%', height: 200 },
  photoInfo: { padding: Spacing.three },
  photoReto: { fontSize: 15, marginBottom: Spacing.half },
  photoFecha: { fontSize: 13 },
});