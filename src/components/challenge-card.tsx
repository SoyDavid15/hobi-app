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
import * as ImagePicker from 'expo-image-picker';
import { supabase } from "../../supabaseClient";
import axios from 'axios'; 

const API_URL = "https://hobi-backend-yjzs.onrender.com"; 

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

  // 💡 Mapeamos la función del hook correctamente
  const { progress, loading: backendLoading, dailyChallenge, refreshProgress } = useUserProgress();
  const theme = useTheme();

  const challengeText = useMemo(() => getNonEmptyChallenge(dailyChallenge), [dailyChallenge]);
  const isStillLoading = isLocalLoading || backendLoading || challengeText === "Cargando reto...";

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

  const completed = useMemo(() => {
    if (isStillLoading) return false;
    if (lastSavedChallenge === challengeText && challengeText !== "No hay retos disponibles") return true;
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
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Necesitamos permiso para acceder a la cámara.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    const uploadWithRetry = async (formData: any, retries = 2) => {
  try {
    return await axios.post(`${API_URL}/retos/realizado`, formData, { timeout: 30000 });
  } catch (error: any) {
    if (retries > 0) {
      console.log("Servidor despertando, reintentando...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos
      return uploadWithRetry(formData, retries - 1);
    }
    throw error;
  }
};

    if (result.canceled) return;

    setIsMarking(true);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        Alert.alert("Error", "Debes iniciar sesión para completar el reto.");
        setIsMarking(false);
        return;
      }

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('user_id', String(user.id)); 

      const fileName = asset.fileName || asset.uri.split('/').pop() || 'reto.jpg';
      const mimeType = asset.mimeType || 'image/jpeg';

      formData.append('file', {
        uri: asset.uri,
        name: fileName,
        type: mimeType,
      } as any);

      // --- SUBIDA A BACKEND ---
      await axios.post(`${API_URL}/retos/realizado`, formData, {
        headers: { 'Accept': 'application/json' },
        timeout:80000
      });

      // --- ÉXITO ---
      await AsyncStorage.setItem('lastCompletedChallenge', challengeText);
      setLastSavedChallenge(challengeText);
      
      // 💡 Actualizamos la UI inmediatamente llamando a refreshProgress del hook
      await refreshProgress(); 
      
      Alert.alert("¡Éxito!", "Reto completado correctamente.");
      
    } catch (error: any) {
      console.error("Error al subir:", error);
      Alert.alert("Error", error.response?.data?.detail || "No se pudo subir la foto.");
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
          style={[styles.uploadButton, (isMarking || completed || isStillLoading) && styles.uploadButtonDisabled]}
          disabled={isMarking || completed || isStillLoading}
        >
          {isMarking || isStillLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.uploadButtonText}>
              {completed ? "✓ Realizado" : "Tomar foto y realizar"}
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