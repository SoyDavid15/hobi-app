import { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, AppState, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../supabaseClient";

import { ThemedText } from "@/components/themed-text";
import { ChallengeCard } from "@/components/challenge-card";
import { useAuth } from "@/providers/auth-provider";
import { scheduleDailyChallengeNotifications } from "../../notifications";
import { useTheme } from "@/hooks/use-theme";
import { BottomTabInset, Spacing } from "@/constants/theme";

const API_URL = "https://hobi-backend-yjzs.onrender.com";
const SELECTED_HOBBIES_KEY = "@hobi-selected-hobbies";
const NOTIF_THROTTLE_MS = 5 * 60 * 1000;

const throttledScheduleNotifications = (lastRef: React.MutableRefObject<number>) => {
  const now = Date.now();
  if (now - lastRef.current >= NOTIF_THROTTLE_MS) {
    lastRef.current = now;
    scheduleDailyChallengeNotifications();
  }
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos dias";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
};

const Home = () => {
  const { session, signOut } = useAuth();
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const isDark = theme.background === "#000000";
  const mountedRef = useRef(true);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const lastNotifRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    if (!session) signOut();
    return () => { mountedRef.current = false; };
  }, [session, signOut]);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUsername(
        user?.user_metadata?.displayName ||
        user?.email?.split("@")[0] ||
        null
      );
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (session) throttledScheduleNotifications(lastNotifRef);
  }, [session]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") throttledScheduleNotifications(lastNotifRef);
    });
    return () => subscription.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(SELECTED_HOBBIES_KEY).then((saved) => {
        if (mountedRef.current) {
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setSelectedHobbies(Array.isArray(parsed) ? parsed : []);
            } catch {
              setSelectedHobbies([saved]);
            }
          } else {
            setSelectedHobbies([]);
          }
        }
      });

      AsyncStorage.getItem("@hobi-pending-sync").then(async (pendingSync) => {
        if (pendingSync && session?.user) {
          try {
            const hobbies = JSON.parse(pendingSync);
            const formData = new FormData();
            formData.append("user_id", session.user.id);
            formData.append("hobbies", JSON.stringify(hobbies));
            const response = await fetch(`${API_URL}/usuarios/hobbies`, {
              method: "POST",
              body: formData,
            });
            if (response.ok) await AsyncStorage.removeItem("@hobi-pending-sync");
          } catch {}
        }
      });
    }, [session])
  );

  const gradientColors: [string, string, string] = isDark
    ? ["#1a0a2e", "#16213e", "#000000"]
    : ["#fff0f6", "#ffecd2", "#ffffff"];

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.background,
        paddingBottom: safeAreaInsets.bottom + BottomTabInset,
      }
    ]}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={gradientColors}
        style={[styles.headerGradient, { paddingTop: safeAreaInsets.top + Spacing.two }]}
      >
        <View style={styles.headerRow}>
          <View>
            <ThemedText style={[styles.greeting, { color: theme.textSecondary }]}>
              {getGreeting()}
            </ThemedText>
            <ThemedText style={styles.usernameText}>
              {username ? username : "Hobi"}
            </ThemedText>
          </View>
          <View style={[
            styles.logoBubble,
            {
              backgroundColor: isDark ? "rgba(255,107,107,0.15)" : "rgba(255,107,107,0.1)",
              borderColor: isDark ? "rgba(255,107,107,0.3)" : "rgba(255,107,107,0.2)",
            }
          ]}>
            <Ionicons name="flame" size={22} color="#FF6B6B" />
          </View>
        </View>

        <View style={[styles.subtitleRow, {
          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        }]}>
          <Ionicons name="sparkles" size={13} color="#FF9F43" />
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tu reto de hoy te espera
          </ThemedText>
        </View>
      </LinearGradient>

      {/* Tarjeta del reto — ocupa todo el espacio restante */}
      <View style={styles.cardWrapper}>
        <ChallengeCard selectedCategories={selectedHobbies} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerGradient: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  logoBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
  },

  cardWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Home;