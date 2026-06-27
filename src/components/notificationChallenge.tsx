import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

// Interfaz para definir la forma exacta de los datos que envía FastAPI
interface RetoDiario {
  Musica?: string | null;
  Lectura?: string | null;
  Cine_y_Television?: string | null;
  Videojuegos?: string | null;
  Comida?: string | null;
  Deporte?: string | null;
  Salir?: string | null;
  Arte?: string | null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const getStableIndex = (values: string[]): number => {
  const today = new Date().toISOString().split("T")[0];
  const str = today + values.join(",");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % values.length;
};

export const NotificationChallenge = () => {
  const [reto, setReto] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [intento, setIntento] = useState<number>(0);

  const obtenerDato = async () => {
    setLoading(true);
    setError(false);

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const response = await fetch(
          "https://hobi-backend-yjzs.onrender.com/retos",
        );

        if (!response.ok) {
          throw new Error(`Error en el servidor: ${response.status}`);
        }

        const data: RetoDiario = await response.json();

        // Extraemos los valores de texto del objeto, filtrando campos nulos o vacíos
        const valores: string[] = Object.values(data).filter(
          (valor): valor is string =>
            typeof valor === "string" && valor.trim() !== "",
        );

        if (valores.length > 0) {
          const stableIndex = getStableIndex(valores);
          setReto(valores[stableIndex]);
        } else {
          setReto("No hay retos válidos asignados para hoy");
        }
        setLoading(false);
        return; // éxito, salir del loop
      } catch (err) {
        console.warn(`Intento ${i + 1}/${MAX_RETRIES} fallido:`, err);
        if (i < MAX_RETRIES - 1) {
          // Esperar antes del siguiente intento
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
    }

    // Todos los intentos fallaron
    console.error("No se pudo conectar con la API tras varios intentos");
    setError(true);
    setLoading(false);
  };

  useEffect(() => {
    obtenerDato();
  }, [intento]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5e60ce" />
        <Text style={styles.loadingText}>Cargando reto...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>El servidor está despertando</Text>
        <Text style={styles.errorSubtitle}>
          El backend estaba inactivo. Reintentando automáticamente...
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => setIntento((n) => n + 1)}
        >
          <Text style={styles.retryText}>🔄 Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{reto}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f3640",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#95a5a6",
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2f3640",
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "center",
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: "#5e60ce",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: "#5e60ce",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
