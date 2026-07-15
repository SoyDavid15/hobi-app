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
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../supabaseClient";
import { useTheme } from "@/hooks/use-theme"; // Asumiendo que este hook existe en tu proyecto

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  
  const theme = useTheme();

  const validateUsername = (text: string) => {
    const validPattern = /^[a-zA-Z0-9_]+$/;
    return validPattern.test(text) || text === "";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && password.length <= 16;
  };

  const handleNextStep = () => {
    if (!email.trim()) {
      Alert.alert("Error", "El email es requerido");
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert("Error", "El email no es válido");
      return;
    }
    
    if (!password) {
      Alert.alert("Error", "La contraseña es requerida");
      return;
    }
    
    if (!validatePassword(password)) {
      Alert.alert("Error", "La contraseña debe tener entre 8 y 16 caracteres");
      return;
    }
    
    if (!confirmPassword) {
      Alert.alert("Error", "Debes confirmar la contraseña");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    
    setRegistrationStep(2);
  };

  const handleRegister = () => {
    if (!validateUsername(username)) {
      Alert.alert("Error", "El nombre de usuario solo puede contener letras, números y guiones bajos");
      return;
    }
    
    if (!username.trim()) {
      Alert.alert("Error", "El nombre de usuario es requerido");
      return;
    }
    
    handleSubmit();
  };

  const handleBackToStep1 = () => {
    setRegistrationStep(1);
  };

  const handleToggleAuthMode = () => {
    setIsLogin(!isLogin);
    setRegistrationStep(1);
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
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { displayName: username } }
      });
      
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (loginError) {
          Alert.alert("Registro exitoso", "Ya puedes iniciar sesión");
          setIsLogin(true);
          setRegistrationStep(1);
        } else {
          router.replace("/hobby-selector?onboarding=true");
        }
      }
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View>
        <ThemedText type="title" style={styles.logo}>Hobi</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>Sal de tu zona de confort</ThemedText>
      </View>

      {isLogin && (
        <>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
            placeholder="Email"
            placeholderTextColor={theme.textSecondary}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="Contraseña"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Button
            title="Iniciar Sesión"
            onPress={handleSubmit}
            color="#0055DA"
          />

          <TouchableOpacity
            onPress={handleToggleAuthMode}
            style={styles.toggleButton}
          >
            <ThemedText style={styles.toggleText}>
              ¿No tienes cuenta? Regístrate
            </ThemedText>
          </TouchableOpacity>
        </>
      )}

      {!isLogin && registrationStep === 1 && (
        <>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
            placeholder="Email"
            placeholderTextColor={theme.textSecondary}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="Contraseña"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="Confirmar contraseña"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showConfirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.passwordToggle}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Button
            title="Siguiente"
            onPress={handleNextStep}
            color="#0055DA"
          />

          <TouchableOpacity
            onPress={handleToggleAuthMode}
            style={styles.toggleButton}
          >
            <ThemedText style={styles.toggleText}>
              ¿Ya tienes cuenta? Inicia sesión
            </ThemedText>
          </TouchableOpacity>
        </>
      )}

      {!isLogin && registrationStep === 2 && (
        <>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
            placeholder="Nombre de usuario"
            placeholderTextColor={theme.textSecondary}
            onChangeText={setUsername}
            autoCapitalize="none"
            maxLength={20}
          />

          <Button
            title="Registrarse"
            onPress={handleRegister}
            color="#0055DA"
          />

          <TouchableOpacity
            onPress={handleBackToStep1}
            style={styles.toggleButton}
          >
            <ThemedText style={styles.toggleText}>
              Atrás
            </ThemedText>
          </TouchableOpacity>
        </>
      )}
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
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: '#ccc',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
  },
  passwordToggle: {
    padding: 15,
  },
  toggleButton: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
  },
});