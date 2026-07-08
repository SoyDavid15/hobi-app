import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useState } from 'react';
import { StyleSheet, Pressable, View, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { supabase } from '../../supabaseClient';
import { getFriendlyAuthError } from '@/utils/auth-errors';

export default function VerifyEmailScreen() {
  const theme = useTheme();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        router.replace('/hobby-selector?onboarding=true');
        return;
      }
      Alert.alert(
        'Aún no confirmado',
        'Tu correo aún no ha sido verificado. Revisa tu bandeja de entrada y haz clic en el enlace.',
      );
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user?.email) {
        Alert.alert('Error', 'No se pudo obtener tu email. Vuelve a la pantalla de registro.');
        return;
      }
      const { error } = await supabase.auth.resend({
        email: user.email,
        type: 'signup',
      });
      if (error) {
        Alert.alert('Error', getFriendlyAuthError(error));
      } else {
        Alert.alert('Correo reenviado', 'Revisa tu bandeja de entrada y la carpeta de spam.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="mail" size={64} color={theme.textSecondary} />
        <ThemedText type="title" style={styles.title}>
          Verifica tu correo
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Te hemos enviado un enlace de confirmación a tu correo. Haz clic en él para activar tu cuenta.
        </ThemedText>

        <Pressable
          onPress={handleCheckVerification}
          disabled={checking}
          style={styles.primaryButton}
        >
          {checking ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.primaryButtonText}>
              Ya verifiqué mi correo
            </ThemedText>
          )}
        </Pressable>

        <Pressable
          onPress={handleResend}
          disabled={resending}
          style={styles.secondaryButton}
        >
          {resending ? (
            <ActivityIndicator color={theme.text} size="small" />
          ) : (
            <ThemedText style={styles.secondaryButtonText}>
              Reenviar correo
            </ThemedText>
          )}
        </Pressable>

        <Pressable onPress={() => router.replace('/login')}>
          <ThemedText themeColor="textSecondary" style={styles.backText}>
            Volver a inicio de sesión
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  content: {
    alignItems: 'center',
    gap: 20,
    maxWidth: 340,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#0055DA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  backText: {
    fontSize: 13,
    marginTop: 8,
  },
});