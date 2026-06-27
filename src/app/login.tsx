import React, { useState } from 'react';
import { TextInput, Button, Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router'; // Importa el router
import { supabase } from '../../supabaseClient';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  async function handleSubmit() {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        // Redirige al index después del login exitoso
        router.replace('/'); 
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Registro exitoso', 'Ya puedes iniciar sesión');
        setIsLogin(true); // Cambia al modo login tras registrarse
      }
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View>
        <Text style={styles.logo}>Hobi</Text>
      </View>
      
      <TextInput 
        style={styles.input}
        placeholder="Email" 
        onChangeText={setEmail} 
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput 
        style={styles.input}
        placeholder="Contraseña" 
        secureTextEntry 
        onChangeText={setPassword} 
      />
      
      <Button title={isLogin ? "Iniciar Sesión" : "Registrarse"} onPress={handleSubmit} />
      
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center',
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#4f4f4fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14,
  }
});