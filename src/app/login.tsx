import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../supabaseClient";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const validateUsername = (text: string) => {
    const validPattern = /^[a-zA-Z0-9_]+$/;
    return validPattern.test(text) || text === "";
  };

  async function handleSubmit() {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        router.replace("/");
      }
    } else {
      if (!validateUsername(username)) {
        Alert.alert("Error", "El nombre de usuario solo puede contener letras, números y guiones bajos");
        return;
      }
      
      if (password !== confirmPassword) {
        Alert.alert("Error", "Las contraseñas no coinciden");
        return;
      }
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            displayName: username,
          }
        }
      });
      if (error) {
        if (error.message?.includes('rate limit') || error.message?.includes('Rate limit')) {
          Alert.alert("Límite alcanzado", "Has alcanzado el límite de correos. Por favor espera unos minutos antes de intentar de nuevo.");
        } else {
          Alert.alert("Error", error.message);
        }
      } else {
        Alert.alert("Registro exitoso", "Ya puedes iniciar sesión");
        setIsLogin(true);
      }
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View>
        <ThemedText type="title" style={styles.logo}>Hobi</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>Sal de tu zona de confort</ThemedText>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario (display name)"
          onChangeText={setUsername}
          autoCapitalize="none"
          maxLength={20}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        onChangeText={setPassword}
      />
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          secureTextEntry
          onChangeText={setConfirmPassword}
        />
      )}

      <Button
        title={isLogin ? "Iniciar Sesión" : "Registrarse"}
        onPress={handleSubmit}
      />

      <TouchableOpacity
        onPress={() => setIsLogin(!isLogin)}
        style={styles.toggleButton}
      >
        <ThemedText style={styles.toggleText}>
          {isLogin
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  logo: {
    fontSize: 70,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  toggleButton: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
  },
});
