import { useState, useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { HobiCharacter } from '@/components/hobi-character';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { supabase } from '../../../supabaseClient';
import { useUserProgress, useUserPhotos, UserPhoto } from '@/hooks/user-progress';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 10;
const SIDE_PADDING = 16;
const COL_WIDTH = (SCREEN_WIDTH - SIDE_PADDING * 2 - COLUMN_GAP) / 2;

// Alturas variables para efecto masonry/Pinterest
const PHOTO_HEIGHTS = [220, 160, 190, 240, 170, 200, 150, 230];

const HOBI_ACCENT = '#FF6B6B';
const HOBI_SECONDARY = '#FF9F43';
const HOBI_PURPLE = '#A855F7';
const HOBI_TEAL = '#14B8A6';

export default function ProfileScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const isDark = theme.background === '#000000';

  const { progress } = useUserProgress();
  const { photos, loading: photosLoading, error: photosError } = useUserPhotos();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<(UserPhoto & { height: number }) | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || 'Usuario');
      setUsername(user?.user_metadata?.displayName || user?.email?.split('@')[0] || 'Usuario');
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (selectedPhoto) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
    }
  }, [selectedPhoto]);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Dividir fotos en dos columnas para masonry
  const leftColumn: (UserPhoto & { height: number })[] = [];
  const rightColumn: (UserPhoto & { height: number })[] = [];
  photos.forEach((photo, i) => {
    const height = PHOTO_HEIGHTS[i % PHOTO_HEIGHTS.length];
    if (i % 2 === 0) leftColumn.push({ ...photo, height });
    else rightColumn.push({ ...photo, height });
  });

  const gradientColors: [string, string, string] = isDark
    ? ['#1a0a2e', '#16213e', '#000000']
    : ['#fff0f6', '#ffecd2', '#ffffff'];

  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentInset={insets}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER CON GRADIENTE */}
        <LinearGradient
          colors={gradientColors}
          style={[styles.headerGradient, { paddingTop: insets.top || Spacing.four }]}
        >
          {/* Boton de ajustes */}
          <Pressable
            style={[styles.settingsButton, { top: (insets.top || Spacing.four) + 8 }]}
            onPress={() => router.push('/settings')}
            hitSlop={12}
          >
            <View style={[styles.iconBubble, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Ionicons name="settings-outline" size={18} color={theme.text} />
            </View>
          </Pressable>

          {/* Avatar */}
          <View style={[styles.avatarRing, { borderColor: HOBI_ACCENT }]}>
            <View style={[styles.avatarInner, { backgroundColor: isDark ? '#1a0a2e' : '#fff0f6' }]}>
              <HobiCharacter size={56} />
            </View>
          </View>

          <ThemedText style={styles.username}>{username || 'Cargando...'}</ThemedText>
          <ThemedText style={[styles.email, { color: theme.textSecondary }]}>
            {userEmail || 'Buscando perfil...'}
          </ThemedText>

          {/* STATS */}
          <View style={styles.statsRow}>
            <StatCard
              icon="flame"
              iconColor={HOBI_ACCENT}
              value={progress?.streak ?? 0}
              label="Racha"
              bg={isDark ? 'rgba(255,107,107,0.15)' : 'rgba(255,107,107,0.1)'}
              border={isDark ? 'rgba(255,107,107,0.3)' : 'rgba(255,107,107,0.2)'}
            />
            <StatCard
              icon="checkmark-circle"
              iconColor={HOBI_TEAL}
              value={progress?.completedChallenges ?? 0}
              label="Completados"
              bg={isDark ? 'rgba(20,184,166,0.15)' : 'rgba(20,184,166,0.1)'}
              border={isDark ? 'rgba(20,184,166,0.3)' : 'rgba(20,184,166,0.2)'}
            />

          </View>

          {/* Motivacion */}
          {(progress?.streak ?? 0) > 0 && (
            <View style={[styles.motivationBadge, {
              backgroundColor: isDark ? 'rgba(255,159,67,0.15)' : 'rgba(255,159,67,0.12)',
              borderColor: isDark ? 'rgba(255,159,67,0.35)' : 'rgba(255,159,67,0.25)',
            }]}>
              <Ionicons name="trophy" size={14} color={HOBI_SECONDARY} />
              <ThemedText style={[styles.motivationText, { color: HOBI_SECONDARY }]}>
                {progress?.streak} dias de racha! Sigue asi
              </ThemedText>
            </View>
          )}
        </LinearGradient>

        {/* GALERIA MASONRY (Pinterest style) */}
        <View style={styles.gallerySection}>
          <View style={styles.galleryHeader}>
            <ThemedText style={styles.galleryTitle}>Mi galeria</ThemedText>
            <View style={[styles.galleryBadge, {
              backgroundColor: isDark ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.12)',
              borderColor: isDark ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.25)',
            }]}>
              <ThemedText style={[styles.galleryCount, { color: HOBI_PURPLE }]}>
                {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
              </ThemedText>
            </View>
          </View>

          {photosLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={HOBI_ACCENT} />
              <ThemedText style={[styles.stateText, { color: theme.textSecondary }]}>
                Cargando galeria...
              </ThemedText>
            </View>
          ) : photosError ? (
            <View style={styles.centerState}>
              <View style={[styles.stateIcon, { backgroundColor: isDark ? 'rgba(255,107,107,0.15)' : 'rgba(255,107,107,0.1)' }]}>
                <Ionicons name="cloud-offline-outline" size={32} color={HOBI_ACCENT} />
              </View>
              <ThemedText style={[styles.stateText, { color: theme.textSecondary }]}>
                {photosError}
              </ThemedText>
            </View>
          ) : photos.length === 0 ? (
            <View style={styles.centerState}>
              <View style={[styles.stateIcon, { backgroundColor: isDark ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.1)' }]}>
                <Ionicons name="camera-outline" size={32} color={HOBI_PURPLE} />
              </View>
              <ThemedText style={[styles.stateTitle, { color: theme.text }]}>
                Aun no hay fotos
              </ThemedText>
              <ThemedText style={[styles.stateText, { color: theme.textSecondary }]}>
                Completa tu primer reto y empieza tu galeria
              </ThemedText>
            </View>
          ) : (
            /* Masonry grid */
            <View style={styles.masonryGrid}>
              {/* Columna izquierda */}
              <View style={styles.masonryColumn}>
                {leftColumn.map((photo, i) => (
                  <PhotoTile
                    key={`left-${i}`}
                    photo={photo}
                    height={photo.height}
                    onPress={() => setSelectedPhoto(photo)}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    isDark={isDark}
                  />
                ))}
              </View>
              {/* Columna derecha con offset visual */}
              <View style={[styles.masonryColumn, styles.masonryColumnOffset]}>
                {rightColumn.map((photo, i) => (
                  <PhotoTile
                    key={`right-${i}`}
                    photo={photo}
                    height={photo.height}
                    onPress={() => setSelectedPhoto(photo)}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    isDark={isDark}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL DE FOTO */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="none"
        onRequestClose={() => setSelectedPhoto(null)}
        statusBarTranslucent
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedPhoto(null)} />

          {selectedPhoto && (
            <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
              {/* Imagen */}
              <Image
                source={{ uri: selectedPhoto.url }}
                style={styles.modalImage}
                contentFit="cover"
                transition={200}
              />

              {/* Overlay inferior */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.modalGradient}
              >
                <View style={styles.modalInfo}>
                  <View style={[styles.modalTag, {
                    backgroundColor: 'rgba(255,107,107,0.25)',
                    borderColor: 'rgba(255,107,107,0.4)',
                  }]}>
                    <Ionicons name="trophy" size={12} color={HOBI_ACCENT} />
                    <ThemedText style={[styles.modalTagText, { color: HOBI_ACCENT }]}>Reto completado</ThemedText>
                  </View>
                  <ThemedText style={styles.modalReto}>{selectedPhoto.reto}</ThemedText>
                  {selectedPhoto.fecha && (
                    <View style={styles.modalDateRow}>
                      <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.6)" />
                      <ThemedText style={styles.modalFecha}>{formatDate(selectedPhoto.fecha)}</ThemedText>
                    </View>
                  )}
                </View>
              </LinearGradient>

              {/* Boton cerrar */}
              <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedPhoto(null)}>
                <View style={styles.modalCloseInner}>
                  <Ionicons name="close" size={20} color="#fff" />
                </View>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </Modal>
    </View>
  );
}

/* COMPONENTES AUXILIARES */

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: number;
  label: string;
  bg: string;
  border: string;
}

function StatCard({ icon, iconColor, value, label, bg, border }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: iconColor }]}>{label}</ThemedText>
    </View>
  );
}

interface PhotoTileProps {
  photo: UserPhoto & { height: number };
  height: number;
  onPress: () => void;
  cardBg: string;
  cardBorder: string;
  isDark: boolean;
}

function PhotoTile({ photo, height, onPress, cardBg, cardBorder, isDark }: PhotoTileProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.96, friction: 8, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.photoTileWrapper}
    >
      <Animated.View
        style={[
          styles.photoTile,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={{ uri: photo.url }}
          style={[styles.photoTileImage, { height }]}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.photoTileInfo}>
          <ThemedText style={styles.photoTileLabel} numberOfLines={2}>
            {photo.reto}
          </ThemedText>
          {photo.period && (
            <ThemedText style={[styles.photoTilePeriod, {
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
            }]}>
              {photo.period}
            </ThemedText>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },

  /* Header */
  headerGradient: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    alignItems: 'center',
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    right: Spacing.three,
    zIndex: 10,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Avatar */
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
  },
  avatarInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  username: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    marginBottom: Spacing.three,
    opacity: 0.8,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Motivacion */
  motivationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: Spacing.two,
  },
  motivationText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Galeria */
  gallerySection: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  galleryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  galleryCount: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Estado vacio / error */
  centerState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: Spacing.two,
  },
  stateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  stateText: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: 18,
  },

  /* Masonry grid */
  masonryGrid: {
    flexDirection: 'row',
    gap: COLUMN_GAP,
  },
  masonryColumn: {
    flex: 1,
    gap: COLUMN_GAP,
  },
  masonryColumnOffset: {
    marginTop: 30,
  },

  /* Photo tile */
  photoTileWrapper: {},
  photoTile: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  photoTileImage: {
    width: '100%',
  },
  photoTileInfo: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
  },
  photoTileLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  photoTilePeriod: {
    fontSize: 11,
    fontWeight: '500',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  modalImage: {
    width: '100%',
    height: 400,
  },
  modalGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    justifyContent: 'flex-end',
  },
  modalInfo: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  modalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalTagText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalReto: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 24,
  },
  modalDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modalFecha: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  modalCloseInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});