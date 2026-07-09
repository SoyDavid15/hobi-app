import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
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
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; reto: string; fecha: string | null } | null>(null);

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
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top || Spacing.three }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>
          
          <View style={styles.headerContainer}>
            <Pressable style={styles.menuButton} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={20} color={theme.text} />
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
            <View style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons name="flame" size={20} color="#FF6B6B" />
                <ThemedText type="subtitle" style={styles.statValue}>
                  {progress?.streak ?? 0}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                Racha
              </ThemedText>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <ThemedText type="subtitle" style={styles.statValue}>
                  {progress?.completedChallenges ?? 0}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                Completados
              </ThemedText>
            </View>
          </View>

          <View style={styles.motivationContainer}>
            <ThemedText type="defaultSemiBold" style={styles.motivationText}>
              ¡Sigue así! {progress?.streak ?? 0} días de racha
            </ThemedText>
          </View>

          <View style={styles.galleryContainer}>
            <ThemedText type="defaultSemiBold" style={styles.galleryTitle}>
              Mi galeria de retos
            </ThemedText>

            {photosLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.textSecondary} />
              </View>
            ) : photosError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="cloud-offline-outline" size={40} color={theme.textSecondary} />
                <ThemedText themeColor="textSecondary" style={styles.errorText}>
                  {photosError}
                </ThemedText>
              </View>
            ) : photos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="camera-outline" size={40} color={theme.textSecondary} />
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  Completa tu primer reto
                </ThemedText>
              </View>
            ) : (
              <View style={styles.photosList}>
                {photos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoCard}
                    activeOpacity={0.85}
                    onPress={() => setSelectedPhoto({ url: photo.url, reto: photo.reto, fecha: photo.fecha })}
                  >
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
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalClose} onPress={() => setSelectedPhoto(null)}>
            <Ionicons name="close" size={32} color="#fff" />
          </Pressable>
          {selectedPhoto && (
            <>
              <Image
                source={{ uri: selectedPhoto.url }}
                style={styles.modalImage}
                contentFit="contain"
              />
              <View style={styles.modalInfo}>
                <ThemedText type="defaultSemiBold" style={styles.modalReto}>
                  {selectedPhoto.reto}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.modalFecha}>
                  {formatDate(selectedPhoto.fecha)}
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: Spacing.four },
  container: { flex: 1 },
  innerContainer: { maxWidth: MaxContentWidth, flexGrow: 1, paddingHorizontal: Spacing.three },
  headerContainer: { alignItems: 'center', marginBottom: Spacing.three, marginTop: Spacing.one, position: 'relative' },
  menuButton: { position: 'absolute', top: 0, right: 0, padding: Spacing.two, zIndex: 10 },
  profileContent: { alignItems: 'center' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.two, overflow: 'hidden' },
  username: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.half },
  email: { fontSize: 13, opacity: 0.7 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three, marginBottom: Spacing.three },
  statCard: { flex: 1, padding: Spacing.three, alignItems: 'center' },
  statContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.half },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  motivationContainer: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.three, marginBottom: Spacing.three, borderRadius: 16 },
  motivationText: { fontSize: 14, textAlign: 'center' },
  galleryContainer: { padding: Spacing.three, borderRadius: 16 },
  galleryTitle: { fontSize: 16, marginBottom: Spacing.three, textAlign: 'center' },
  loadingContainer: { alignItems: 'center', paddingVertical: Spacing.four },
  errorContainer: { alignItems: 'center', paddingVertical: Spacing.four },
  errorText: { marginTop: Spacing.two, fontSize: 13, textAlign: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing.four },
  emptyText: { marginTop: Spacing.two, fontSize: 13, textAlign: 'center' },
  photosList: { gap: Spacing.three },
  photoCard: { borderRadius: 12, overflow: 'hidden' },
  photoImage: { width: '100%', height: 320 },
  photoInfo: { padding: Spacing.three, paddingTop: Spacing.two },
  photoReto: { fontSize: 15, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: Spacing.two },
  modalImage: { width: '100%', height: '80%' },
  modalInfo: { position: 'absolute', bottom: 40, left: 0, right: 0, paddingHorizontal: Spacing.four, alignItems: 'center' },
  modalReto: { fontSize: 18, color: '#fff', marginBottom: Spacing.one },
  modalFecha: { fontSize: 14, color: '#aaa' },
});