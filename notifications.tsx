import { useEffect } from 'react';
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

export function useChallengeNotification(challenge: any) {
  useEffect(() => {
    // Si estás en Expo Go, salimos silenciosamente para que puedas seguir desarrollando
    if (isExpoGo || !challenge || !Notifications) {
      if (isExpoGo && challenge) {
        console.warn("⚠️ Notificaciones omitidas: Expo Go SDK 53+ no las soporta de manera nativa.");
      }
      return;
    }

    const checkAndNotify = async () => {
      // 1. VERIFICACIÓN DE PREFERENCIA: Leemos el estado del Switch de configuración
      const isEnabledSetting = await AsyncStorage.getItem('@hobi-notifications-enabled');
      
      // Si el usuario las apagó explícitamente, cancelamos la ejecución
      if (isEnabledSetting === 'false') {
        return; 
      }

      const currentChallengeString = JSON.stringify(challenge);
      const lastNotified = await AsyncStorage.getItem('lastNotifiedChallenge');

      if (lastNotified !== currentChallengeString) {
        const { status } = await Notifications.requestPermissionsAsync();
        
        if (status === 'granted') {
          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'default',
              importance: Notifications.AndroidImportance.MAX,
            });
          }

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "¡Nuevo reto disponible! 🚀",
              body: "No dejes que se enfríe tu racha!",
            },
            trigger: null,
          });

          await AsyncStorage.setItem('lastNotifiedChallenge', currentChallengeString);
        }
      }
    };

    checkAndNotify();
  }, [challenge]);
}