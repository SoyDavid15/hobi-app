import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider } from "@/providers/auth-provider";
import { scheduleDailyChallengeNotifications } from '../../notifications';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    scheduleDailyChallengeNotifications();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="settings" />
          <Stack.Screen
            name="hobby-selector"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}