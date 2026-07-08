import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Evitamos que el import estático rompa el arranque en Expo Go SDK 53
let Notifications: any = null;
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log("Las notificaciones no están disponibles en este entorno nativo.");
  }
}

export async function scheduleDailyChallengeNotifications() {
  if (isExpoGo || !Notifications) {
    console.log("[HobiNotif] Notificaciones no disponibles en este entorno");
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const isEnabled = await AsyncStorage.getItem('@hobi-notifications-enabled');
  console.log("[HobiNotif] Estado de notificaciones en storage:", isEnabled);
  if (isEnabled === 'false') {
    console.log("[HobiNotif] Notificaciones desactivadas por el usuario");
    return;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  console.log("[HobiNotif] Estado de permisos:", status);
  if (status !== 'granted') {
    console.log("[HobiNotif] Permisos no concedidos, no se programan notificaciones");
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Nuevo día, nuevos retos! 🚀",
      body: "Tu reto de la mañana ya está disponible",
      sound: true,
    },
    trigger: {
      hour: 0,
      minute: 0,
      repeats: true,
    },
  });
  console.log("[HobiNotif] Notificación medianoche (00:00) programada");

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Reto de la tarde! 🌅",
      body: "No dejes que se enfríe tu racha",
      sound: true,
    },
    trigger: {
      hour: 12,
      minute: 0,
      repeats: true,
    },
  });
  console.log("[HobiNotif] Notificación mediodía (12:00) programada");

  console.log("[HobiNotif] Todas las notificaciones programadas correctamente");
}

export async function updateNotificationSchedule(enabled: boolean) {
  if (isExpoGo || !Notifications) return;
  
  console.log("[HobiNotif] Actualizando preferencia de notificaciones:", enabled);
  await AsyncStorage.setItem('@hobi-notifications-enabled', enabled ? 'true' : 'false');
  
  if (enabled) {
    await scheduleDailyChallengeNotifications();
  } else {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("[HobiNotif] Notificaciones canceladas por el usuario");
  }
}