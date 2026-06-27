import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NotificationChallenge } from "./notificationChallenge";

const API_BASE = "https://hobi-backend-yjzs.onrender.com";

export function ChallengeCard() {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonScale] = useState(() => new Animated.Value(1));

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
      const response = await fetch(`${API_BASE}/retos/realizado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

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
      <NotificationChallenge />

      {completed && (
        <View style={styles.successBadge}>
          <Text style={styles.successText}>✓ Realizado</Text>
        </View>
      )}

      {/* Botón Realizado */}
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
            <Text style={styles.uploadButtonText}>Realizado</Text>
          )}
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    height: "100%",
    backgroundColor: "#f5f6fa",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e1e4e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00000072",
    textAlign: "center",
  },
  cardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#00CF3720",
    color: "#00CF37",
    fontSize: 12,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2f3640",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    marginBottom: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f2f5",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f3640",
  },
  statLabel: {
    fontSize: 12,
    color: "#95a5a6",
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: "transparent",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#e1e4e8",
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: "100%",
    width: "33%",
    backgroundColor: "#ffa500",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "right",
  },
  // Estilos del botón Realizado
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  uploadButton: {
    backgroundColor: "#5e60ce",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    width: "90%",
    alignItems: "center",
    shadowColor: "#5e60ce",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: "#00CF37",
    shadowColor: "#00CF37",
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  // Indicador de éxito
  successBadge: {
    marginTop: 12,
    backgroundColor: "#00CF37",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
});
