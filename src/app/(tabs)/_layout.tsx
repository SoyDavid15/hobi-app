import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  const colors = useTheme(); 

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary || '#8e8e93',
        
        // DISEÑO TOTALMENTE PLANO Y MINIMALISTA (Sin líneas ni sombras)
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,      // Elimina la línea superior divisoria
          elevation: 0,           // Elimina la sombra en Android
          shadowOpacity: 0,       // Elimina la sombra en iOS
          height: 60,             // Altura limpia para los elementos
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',      // Tipografía limpia y moderna
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: 'Hobi',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'happy' : 'happy-outline'} size={22} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}