import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useUserProgress, DailyChallenge } from "@/hooks/user-progress";
import { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HobiCharacter } from "./hobi-character";
import { useTheme } from "@/hooks/use-theme";

const getNonEmptyChallenge = (challenge: DailyChallenge | null): string => {
  if (!challenge) return "Cargando reto...";
  const entries = Object.entries(challenge);
  for (const [, value] of entries) {
    if (value) return value;
  }
  return "No hay retos disponibles";
};

export function ChallengeCard() {
  const [isMarking, setIsMarking] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(true);
  const [lastSavedChallenge, setLastSavedChallenge] = useState<string | null>(null);
  const [buttonScale] = useState(() => new Animated.Value(1));

  const { addChallenge, progress, loading: backendLoading, dailyChallenge } = useUserProgress();
  const theme = useTheme();

  const challengeText = useMemo(() => getNonEmptyChallenge(dailyChallenge), [dailyChallenge]);

  // Bloqueo de UI: Mientras esto sea true, el botón está deshabilitado
  const isStillLoading = isLocalLoading || backendLoading || challengeText === "Cargando reto...";

  // 1. Cargar el estado guardado en disco al iniciar
  useEffect(() => {
    const loadSavedChallenge = async () => {
      try {
        const saved = await AsyncStorage.getItem('lastCompletedChallenge');
        setLastSavedChallenge(saved);
      } catch (e) {
        console.error("Error cargando caché", e);
      } finally {
        setIsLocalLoading(false);
      }
    };
    loadSavedChallenge();
  }, []);

  // 2. Determinar si está completado: lógica prioritaria
  const completed = useMemo(() => {
    if (isStillLoading) return false;

    // Verificación 1: Si el texto del reto actual es igual al que ya marcamos en disco
    if (lastSavedChallenge === challengeText && challengeText !== "No hay retos disponibles") {
      return true;
    }

    // Verificación 2: Seguridad adicional con fecha del servidor
    if (!progress?.lastCompletedDate) return false;
    const today = new Date().toDateString();
    const lastDate = new Date(progress.lastCompletedDate).toDateString();
    return today === lastDate;
  }, [progress?.lastCompletedDate, lastSavedChallenge, challengeText, isStillLoading]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  };

  const markAsDone = async () => {
    setIsMarking(true);
    try {
      await addChallenge();
      // Guardamos el reto actual para bloquearlo incluso si reinician la app
      await AsyncStorage.setItem('lastCompletedChallenge', challengeText);
      setLastSavedChallenge(challengeText);
      Alert.alert("¡Hecho!", "El reto ha sido marcado como realizado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo marcar el reto como realizado.");
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <ThemedView style={styles.card}>
      <HobiCharacter />

      <View style={styles.infoContainer}>
        <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText style={styles.badgeText}>Reto Diario</ThemedText>
        </View>

        <ThemedText style={styles.challengeTitle} type="defaultSemiBold">
          {challengeText}
        </ThemedText>
      </View>

      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={markAsDone}
          style={[
            styles.uploadButton,
            (isMarking || completed || isStillLoading) && styles.uploadButtonDisabled,
          ]}
          // El botón está deshabilitado mientras carga o si ya está hecho
          disabled={isMarking || completed || isStillLoading}
        >
          {isMarking || isStillLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.uploadButtonText}>
              {completed ? "✓ Realizado" : "Hecho"}
            </ThemedText>
          )}
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "85%",
    maxWidth: 370,
    backgroundColor: "transparent",
    padding: 20,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 15,
  },
  infoContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: 15,
    marginBottom: 20,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  challengeTitle: { fontSize: 16, fontWeight: "bold", textAlign: "left" },
  buttonContainer: { width: "100%", alignItems: "center" },
  uploadButton: {
    backgroundColor: "#0055DA",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    elevation: 4,
  },
  uploadButtonDisabled: {
    backgroundColor: "#b2bec3",
    shadowOpacity: 0,
    elevation: 0,
  },
  uploadButtonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
});