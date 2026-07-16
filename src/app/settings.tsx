import { Pressable, StyleSheet, View, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme, triggerThemeChange } from '@/hooks/use-theme';
import { supabase } from '../../supabaseClient';
import { updateNotificationSchedule } from '../../notifications';

const THEME_KEY = '@hobi-theme';
const NOTIFICATIONS_KEY = '@hobi-notifications-enabled';
const API_BASE = "https://hobi-backend-yjzs.onrender.com";

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // true por defecto

  useEffect(() => {
    // Cargar preferencia del tema
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved !== null) {
        setIsDark(saved === 'dark');
      }
    });

    // Cargar preferencia de notificaciones
    AsyncStorage.getItem(NOTIFICATIONS_KEY).then((saved) => {
      if (saved !== null) {
        // Si ya hay un valor guardado ('true' o 'false'), lo asignamos
        setNotificationsEnabled(saved === 'true');
      } else {
        // Si es la primera vez (null), se mantiene activado y lo guardamos
        AsyncStorage.setItem(NOTIFICATIONS_KEY, 'true');
      }
    });
  }, []);

  const toggleTheme = (value: boolean) => {
    const newTheme = value ? 'dark' : 'light';
    setIsDark(value);
    AsyncStorage.setItem(THEME_KEY, newTheme);
    triggerThemeChange(newTheme);
  };

  // Nueva función para alternar las notificaciones
  const toggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    updateNotificationSchedule(value);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="subtitle" style={styles.title}>
          Configuración
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Preferencias
          </ThemedText>
          
          {/* Item de Notificaciones Modificado con Switch */}
          <View style={styles.settingItem}>
            <Ionicons 
              name={notificationsEnabled ? "notifications" : "notifications-outline"} 
              size={22} 
              color={theme.text} 
            />
            <ThemedText style={styles.settingLabel}>Notificaciones</ThemedText>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#ccc', true: '#0055DA' }}
              thumbColor={notificationsEnabled ? '#0055DA' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <Ionicons name={isDark ? "moon" : "moon-outline"} size={22} color={theme.text} />
            <ThemedText style={styles.settingLabel}>Tema oscuro</ThemedText>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#ccc', true: '#0055DA' }}
              thumbColor={isDark ? '#0055DA' : '#f4f3f4'}
            />
          </View>

          <Pressable style={styles.settingItem}>
            <Ionicons name="language-outline" size={22} color={theme.text} />
            <ThemedText style={styles.settingLabel}>Idioma</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.settingValue}>
              Español
            </ThemedText>
          </Pressable>

          <Pressable 
            style={styles.settingItem}
            onPress={() => router.push('/hobby-selector')}
          >
            <Ionicons name="apps-outline" size={22} color={theme.text} />
            <ThemedText style={styles.settingLabel}>Mis Hobbies</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </Pressable>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <Pressable 
            style={styles.settingItem} 
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace('/login');
            }}
          >
              <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
              <ThemedText style={[styles.settingLabel, { color: '#FF6B6B' }]}>Cerrar sesión</ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <Pressable
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  "Eliminar cuenta",
                  "Esta acción es irreversible. Se borrarán todos tus datos, fotos, progreso y tu cuenta de acceso. ¿Estás completamente seguro?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    { 
                      text: "Eliminar",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          const { data: { user } } = await supabase.auth.getUser();
                          const { data: { session } } = await supabase.auth.getSession();
                          if (!user) { Alert.alert("Error", "No se pudo obtener el usuario"); return; }
                          
                          const response = await fetch(`${API_BASE}/usuarios/${user.id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${session?.access_token}`,
                            },
                          });
                          
                          if (!response.ok) {
                            const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }));
                            Alert.alert("Error", errorData.detail || "No se pudo eliminar la cuenta");
                            return;
                          }
                          
                          await supabase.auth.signOut();
                          router.replace('/login');
                        } catch (err: any) {
                          Alert.alert("Error", err.message || "Error al eliminar la cuenta");
                        }
                      }
                    },
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              <ThemedText style={[styles.settingLabel, { color: '#FF6B6B' }]}>Eliminar cuenta</ThemedText>
            </Pressable>
          </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: Spacing.two,
  },
  title: {
    marginLeft: Spacing.three,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  section: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
});