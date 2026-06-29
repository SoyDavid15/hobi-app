import { Pressable, StyleSheet, View, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme, triggerThemeChange } from '@/hooks/use-theme';
import { supabase } from '../../supabaseClient';

const THEME_KEY = '@hobi-theme';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved !== null) {
        setIsDark(saved === 'dark');
      }
    });
  }, []);

  const toggleTheme = (value: boolean) => {
    const newTheme = value ? 'dark' : 'light';
    setIsDark(value);
    AsyncStorage.setItem(THEME_KEY, newTheme);
    triggerThemeChange(newTheme);
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
          
          <Pressable style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={22} color={theme.text} />
            <ThemedText style={styles.settingLabel}>Notificaciones</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </Pressable>

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