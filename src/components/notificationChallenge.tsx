import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

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

export const NotificationChallenge = () => {
  const [reto, setReto] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const obtenerDato = async () => {
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
          // Selecciona una categoría al azar del reto diario obtenido
          const randomIndex = Math.floor(Math.random() * valores.length);
          setReto(valores[randomIndex]);
        } else {
          setReto("No hay retos válidos asignados para hoy");
        }
      } catch (error) {
        console.error("Error al conectar con la API:", error);
        setReto("No se pudo cargar el reto");
      } finally {
        setLoading(false);
      }
    };

    obtenerDato();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
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
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f3640",
    textAlign: "center",
  },
});
