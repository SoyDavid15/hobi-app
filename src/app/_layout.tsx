import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      
      {/* Declaramos solo los archivos que SÍ existen */}
      <Stack 
        screenOptions={{ headerShown: false }}
        unstable_settings={{
          theme: colorScheme === 'dark' ? DarkTheme : DefaultTheme,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="settings" />
      </Stack>
    </ThemeProvider>
  );
}