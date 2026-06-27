import { ThemedView } from "@/components/themed-view";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HobiCharacter } from "./hobi-character";
import { useUserProgress } from "@/hooks/user-progress";

export function ChallengeCard() {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonScale] = useState(() => new Animated.Value(1));
  const { addChallenge, progress } = useUserProgress();

  useEffect(() => {
    if (progress?.lastCompletedDate) {
      const today = new Date();
      const lastDate = new Date(progress.lastCompletedDate);
      if (today.toDateString() === lastDate.toDateString()) {
        setCompleted(true);
      }
    }
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
      setCompleted(true);
      Alert.alert("¡Hecho!", "El reto ha sido marcado como realizado.");
    } catch (error) {
      console.error("Error al marcar como realizado:", error);
      Alert.alert("Error", "No se pudo marcar el reto como realizado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.card}>
      <HobiCharacter />

      <View style={styles.infoContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Fotografia</Text>
        </View>
        
        <Text style={styles.challengeTitle}>
          Toma una foto del atardecer
        </Text>
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
            (loading || completed) && styles.uploadButtonDisabled,
          ]}
          disabled={loading || completed}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.uploadButtonText}>
              {completed ? "✓ Realizado" : "Hecho"}
            </Text>
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
    backgroundColor: "#dcdde1",
    paddingVertical: 4,
    paddingHorizontal:10,
    borderRadius: 10,
    marginBottom: 12,
  },
  badgeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
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
