import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useUserProgress, DailyChallenge } from "@/hooks/user-progress";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HobiCharacter } from "./hobi-character";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/providers/auth-provider";
import * as ImagePicker from "expo-image-picker";


const API_URL = "https://hobi-backend-yjzs.onrender.com";

const uriToBlob = async (uri: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error("Error al leer el archivo"));
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
};

const getNonEmptyChallenge = (challenge: DailyChallenge | null): string => {
  if (!challenge) return "Cargando reto...";
  const entries = Object.entries(challenge);
  for (const [, value] of entries) {
    if (value) return value;
  }
  return "No hay retos disponibles";
};

const uploadWithRetry = async (
  formData: FormData,
  retriesLeft: number,
  timeoutMs: number
): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}/retos/realizado`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.detail || `Error del servidor: ${response.status}`
      );
      (error as any).response = { data: errorData, status: response.status };
      throw error;
    }
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error?.name === "AbortError") {
      error.code = "ECONNABORTED";
    }

    if (retriesLeft <= 0) throw error;

    const delayMs = 2000 * (3 - retriesLeft);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return uploadWithRetry(formData, retriesLeft - 1, timeoutMs);
  }
};

const formatTime = (seconds: number): string => {
  if (seconds <= 0) return "0h 0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m ${s}s`;
};

const getPeriodTitle = (period: string | undefined): string => {
  if (period === "morning") return "Reto de la Mañana";
  if (period === "afternoon") return "Reto de la Tarde";
  return "Reto Diario";
};

export function ChallengeCard() {
  const [isMarking, setIsMarking] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(true);
  const [lastSavedChallenge, setLastSavedChallenge] = useState<string | null>(
    null
  );
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "waking" | "success" | "error"
  >("idle");
  const [buttonScale] = useState(() => new Animated.Value(1));
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [blockedUntilNext, setBlockedUntilNext] = useState<boolean>(false);

  const {
    loading: backendLoading,
    dailyChallenge,
    refreshProgress,
    refreshDailyChallenge,
  } = useUserProgress();
  const { session } = useAuth();
  const theme = useTheme();

  const challengeText = getNonEmptyChallenge(dailyChallenge);
  const isStillLoading =
    isLocalLoading ||
    backendLoading ||
    challengeText === "Cargando reto...";

  const currentPeriod = dailyChallenge?.period || "";
  const isPeriodEnded = timeRemaining <= 0;

  useEffect(() => {
    const loadSavedChallenge = async () => {
      try {
        const saved = await AsyncStorage.getItem("lastCompletedChallenge");
        const savedPeriod = await AsyncStorage.getItem(
          "lastCompletedChallengePeriod"
        );
        setLastSavedChallenge(saved);

        if (saved && savedPeriod === currentPeriod) {
          setBlockedUntilNext(true);
        } else if (saved && savedPeriod !== currentPeriod) {
          await AsyncStorage.setItem("lastCompletedChallengePeriod", "");
          setBlockedUntilNext(false);
        }
      } catch (e) {
        console.error("Error cargando caché", e);
      } finally {
        setIsLocalLoading(false);
      }
    };
    loadSavedChallenge();
  }, [currentPeriod]);

  useEffect(() => {
    if (dailyChallenge?.time_remaining) {
      setTimeRemaining(dailyChallenge.time_remaining);

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            refreshDailyChallenge();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [dailyChallenge?.time_remaining, refreshDailyChallenge]);

  const completed = (() => {
    if (isStillLoading) return false;
    if (
      lastSavedChallenge === challengeText &&
      challengeText !== "No hay retos disponibles"
    )
      return true;
    return false;
  })();

  const isButtonDisabled =
    isMarking ||
    completed ||
    isStillLoading ||
    blockedUntilNext ||
    isPeriodEnded;

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

  const getUserTimezoneOffset = (): number => {
    return -new Date().getTimezoneOffset() / 60;
  };

  const markAsDone = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos permiso para acceder a la cámara."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (result.canceled) return;

    setIsMarking(true);
    setUploadStatus("uploading");

    try {
      if (!session?.user) {
        Alert.alert(
          "Error de sesión",
          "Debes iniciar sesión nuevamente para completar el reto."
        );
        setIsMarking(false);
        setUploadStatus("idle");
        return;
      }

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("user_id", String(session.user.id));
      formData.append("reto_texto", challengeText);
      formData.append("period", currentPeriod);
      formData.append("user_timezone_offset", String(getUserTimezoneOffset()));

      const fileName =
        asset.fileName || asset.uri.split("/").pop() || "reto.jpg";
      const mimeType = asset.mimeType || "image/jpeg";

      try {
        const fileBlob = await uriToBlob(asset.uri);
        formData.append("file", fileBlob, fileName);
      } catch (blobError) {
        console.error("Error al convertir la imagen:", blobError);
        setIsMarking(false);
        setUploadStatus("error");
        Alert.alert(
          "Error",
          "No se pudo leer la imagen capturada. Intenta tomar otra foto."
        );
        return;
      }

      setUploadStatus("uploading");
      try {
        const response = await fetch(`${API_URL}/retos/realizado`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(
            errorData.detail || `Error del servidor: ${response.status}`
          );
          (error as any).response = {
            data: errorData,
            status: response.status,
          };
          throw error;
        }
      } catch (firstError: any) {
        if (firstError.code === "ECONNABORTED") {
          setUploadStatus("waking");
          await uploadWithRetry(formData, 3, 45000);
        } else {
          throw firstError;
        }
      }

      await AsyncStorage.setItem("lastCompletedChallenge", challengeText);
      await AsyncStorage.setItem(
        "lastCompletedChallengePeriod",
        currentPeriod
      );
      setLastSavedChallenge(challengeText);
      setBlockedUntilNext(true);
      await refreshProgress();

      setUploadStatus("success");
      Alert.alert("¡Éxito!", "Reto completado correctamente.");
    } catch (error: any) {
      console.error("Error al subir:", error);
      setUploadStatus("error");

      let message = "No se pudo subir la foto. Intenta de nuevo.";
      if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.code === "ECONNABORTED") {
        message =
          "El servidor tardó demasiado en responder. Intenta de nuevo en unos segundos.";
      } else if (error.message?.includes("Network")) {
        message =
          "Error de conexión. Verifica tu internet e intenta de nuevo.";
      }

      Alert.alert("Error", message);
    } finally {
      setIsMarking(false);
      if (uploadStatus === "waking" || uploadStatus === "uploading") {
        setUploadStatus("idle");
      }
    }
  };

  const getButtonLabel = () => {
    if (blockedUntilNext) return "✓ Completado";
    if (isPeriodEnded) return "Esperando nuevo reto...";
    if (isMarking || isStillLoading) return "";
    if (completed) return "✓ Realizado";
    return "Tomar foto y realizar";
  };

  const getButtonElement = () => {
    if (isMarking || isStillLoading || uploadStatus === "waking") {
      return (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#fff" size="small" />
          <ThemedText style={styles.uploadButtonText}>
            {uploadStatus === "waking"
              ? " Despertando servidor..."
              : isLocalLoading
                ? " Cargando..."
                : " Subiendo..."}
          </ThemedText>
        </View>
      );
    }

    return (
      <ThemedText style={styles.uploadButtonText}>
        {getButtonLabel()}
      </ThemedText>
    );
  };

  return (
    <ThemedView style={styles.card}>
      <HobiCharacter />
      <View style={styles.infoContainer}>
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <ThemedText style={styles.badgeText}>
            {getPeriodTitle(dailyChallenge?.period)}
          </ThemedText>
        </View>
        <ThemedText style={styles.challengeTitle} type="defaultSemiBold">
          {challengeText}
        </ThemedText>
        <View style={styles.countdownContainer}>
          <View style={styles.countdownBadge}>
            <ThemedText style={styles.countdownText}>
              ⏰ {formatTime(timeRemaining)}
            </ThemedText>
          </View>
        </View>
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
            isButtonDisabled && styles.uploadButtonDisabled,
          ]}
          disabled={isButtonDisabled}
        >
          {getButtonElement()}
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
  countdownContainer: {
    marginTop: 8,
    width: "100%",
  },
  countdownBadge: {
    backgroundColor: "#0055DA20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  countdownText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0055DA",
  },
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
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});