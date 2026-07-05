import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from '../../supabaseClient';

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const API_URL = "https://hobi-backend-yjzs.onrender.com";
export const SELECTED_HOBBIES_KEY = "@hobi-selected-hobbies";

interface Categoria {
  key: string;
  label: string;
  icon: string;
  color: string;
}

// Map backend icon names to valid Ionicons names
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  "musical-notes": "musical-notes",
  book: "book",
  film: "film",
  "game-controller": "game-controller",
  restaurant: "restaurant",
  fitness: "fitness",
  walk: "walk",
  "color-palette": "color-palette",
};

export default function HobbySelectorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ onboarding?: string }>();
  const isOnboarding = params.onboarding === "true";
  const theme = useTheme();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [backendError, setBackendError] = useState(false);

  // Animation refs for staggered entrance
  const fadeAnims = useRef<Animated.Value[]>([]);
  const slideAnims = useRef<Animated.Value[]>([]);
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load saved preferences (multi-select: stored as JSON array)
      const saved = await AsyncStorage.getItem(SELECTED_HOBBIES_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setSelectedKeys(parsed);
        } catch {
          // Migration: old single-value format
          setSelectedKeys([saved]);
        }
      }

      // Fetch categories from backend
      const response = await fetch(`${API_URL}/categorias`);
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      const data = await response.json();

      const categoriasList = data.categorias;
      if (!categoriasList || !Array.isArray(categoriasList)) {
        throw new Error("Respuesta inválida del backend");
      }

      setCategorias(categoriasList);

      // Initialize animations
      fadeAnims.current = categoriasList.map(() => new Animated.Value(0));
      slideAnims.current = categoriasList.map(() => new Animated.Value(30));

      setLoading(false);

      // Animate header
      Animated.parallel([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Staggered card animations
      const animations = categoriasList.map((_: Categoria, i: number) =>
        Animated.parallel([
          Animated.timing(fadeAnims.current[i], {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnims.current[i], {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ])
      );

      Animated.stagger(60, animations).start();
    } catch (error) {
      console.error("Error loading categories:", error);
      setBackendError(true);
      setLoading(false);
    }
  };

  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const handleConfirm = async () => {
    if (selectedKeys.length === 0) return;

    setSaving(true);
    
    // 1. Intentar guardar en backend PRIMERO (nube)
    let savedToBackend = false;
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (!authError && user) {
        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('hobbies', JSON.stringify(selectedKeys));
        
        const response = await fetch(`${API_URL}/usuarios/hobbies`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          savedToBackend = true;
          console.log('✅ Hobbies guardados en backend');
        }
      }
    } catch (error) {
      console.warn('⚠️ Backend no disponible, guardando localmente:', error);
      // Continuar sin error - el caché local es válido
    }
    
    // 2. Guardar en AsyncStorage (siempre, como caché)
    await AsyncStorage.setItem(
      SELECTED_HOBBIES_KEY,
      JSON.stringify(selectedKeys)
    );
    
    if (!savedToBackend) {
      console.log('📱 Hobbies guardados localmente (se sincronizarán después)');
    }

    // 3. Navegar (siempre)
    setTimeout(() => {
      setSaving(false);
      if (isOnboarding) {
        router.replace("/");
      } else {
        router.back();
      }
    }, 250);
  };

  const getIconName = (iconKey: string): keyof typeof Ionicons.glyphMap => {
    return ICON_MAP[iconKey] || "help-circle";
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0055DA" />
        <ThemedText style={styles.loadingText}>
          Cargando categorías...
        </ThemedText>
      </ThemedView>
    );
  }

  if (backendError) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Ionicons name="cloud-offline" size={48} color={theme.textSecondary} />
        <ThemedText type="defaultSemiBold" style={styles.errorTitle}>
          No se pudieron cargar las categorías
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.errorSubtitle}>
          El servidor está tardando en responder.{'\n'}Inténtalo de nuevo en unos segundos.
        </ThemedText>
        <Pressable
          onPress={() => {
            setBackendError(false);
            setLoading(true);
            loadData();
          }}
          style={styles.retryButton}
        >
          <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        {!isOnboarding && (
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
        )}
        <View style={styles.headerTextContainer}>
          <ThemedText type="subtitle" style={styles.title}>
            {isOnboarding ? "¡Bienvenido a Hobi!" : "Tus Hobbies"}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {isOnboarding
              ? "Elige las categorías que te interesan"
              : "Selecciona las categorías de retos que prefieres"}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Category Grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {categorias.map((cat, index) => {
          const isSelected = selectedKeys.includes(cat.key);
          const fadeAnim = fadeAnims.current[index] || new Animated.Value(1);
          const slideAnim = slideAnims.current[index] || new Animated.Value(0);

          return (
            <Animated.View
              key={cat.key}
              style={[
                styles.cardWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Pressable
                onPress={() => toggleSelect(cat.key)}
                disabled={saving}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: isSelected
                      ? cat.color + "18"
                      : theme.backgroundElement,
                    borderColor: isSelected ? cat.color : "transparent",
                    borderWidth: 2,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                {/* Icon Circle */}
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: cat.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={getIconName(cat.icon)}
                    size={28}
                    color={cat.color}
                  />
                </View>

                {/* Label */}
                <ThemedText
                  style={[
                    styles.cardLabel,
                    isSelected && { color: cat.color, fontWeight: "800" },
                  ]}
                >
                  {cat.label}
                </ThemedText>

                {/* Selected checkmark */}
                {isSelected && (
                  <View
                    style={[
                      styles.checkBadge,
                      { backgroundColor: cat.color },
                    ]}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Bottom confirm button */}
      <View
        style={[
          styles.footerBar,
          { backgroundColor: theme.background + "F0" },
        ]}
      >
        <Pressable
          onPress={handleConfirm}
          disabled={selectedKeys.length === 0 || saving}
          style={({ pressed }) => [
            styles.confirmButton,
            selectedKeys.length === 0 && styles.confirmButtonDisabled,
            { transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.confirmButtonText}>
              {selectedKeys.length === 0
                ? "Selecciona al menos uno"
                : `Confirmar (${selectedKeys.length})`}
            </ThemedText>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (width - Spacing.four * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
    paddingHorizontal: 40,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#0055DA",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: Spacing.two,
    marginRight: Spacing.two,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: 120,
    gap: CARD_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
    position: "relative",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: 16,
    paddingBottom: 36,
  },
  confirmButton: {
    backgroundColor: "#0055DA",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: "#b2bec3",
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
