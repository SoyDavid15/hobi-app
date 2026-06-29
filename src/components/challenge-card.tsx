import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useUserProgress } from "@/hooks/user-progress";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { HobiCharacter } from "./hobi-character";
import { useTheme } from "@/hooks/use-theme";

export function ChallengeCard() {
  const [loading, setLoading] = useState(false);
  const [buttonScale] = useState(() => new Animated.Value(1));
  const { addChallenge, progress, loading: backendLoading } = useUserProgress();
  const theme = useTheme();
  
  const completed = useMemo(() => {
    if (!progress?.lastCompletedDate) return false;
    const today = new Date();
    const lastDate = new Date(progress.lastCompletedDate);
    return today.toDateString() === lastDate.toDateString();
  }, [progress?.lastCompletedDate]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const markAsDone = async () => {
    setLoading(true);
    try {
      await addChallenge();
      Alert.alert("¡Hecho!", "El reto ha sido marcado como realizado.");
    } catch (error) {
      console.error("Error al marcar como realizado:", error);
      Alert.alert(
        "Error",
        "No se pudo marcar el reto como realizado. Inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.card}>
      <HobiCharacter />

      <View style={styles.infoContainer}>
        <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText style={styles.badgeText}>Reto Diario</ThemedText>
        </View>

        <ThemedText style={styles.challengeTitle} type="defaultSemiBold">Toma una foto del atardecer</ThemedText>
      </View>

      <Animated.View
        style={[
          styles.buttonContainer,
          { transform: [{ scale: buttonScale }] },
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={markAsDone}
          style={[
            styles.uploadButton,
            (loading || completed || backendLoading) &&
              styles.uploadButtonDisabled,
          ]}
          disabled={loading || completed || backendLoading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : backendLoading ? (
            <ThemedText style={styles.uploadButtonText}>Conectando...</ThemedText>
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
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
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
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
