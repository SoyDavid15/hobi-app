import React, { useState } from 'react';
import { Button, TextInput, View, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('¡Éxito!', 'Has iniciado sesión correctamente');
    }
  }

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="Email" 
        onChangeText={setEmail} 
        autoCapitalize="none"
      />
      <TextInput 
        placeholder="Contraseña" 
        secureTextEntry 
        onChangeText={setPassword} 
      />
      <Button title="Iniciar Sesión" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 }
});