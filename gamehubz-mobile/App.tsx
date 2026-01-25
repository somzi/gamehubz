import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, LogBox } from 'react-native'; // Dodao LogBox za svaki slučaj

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import './global.css';

import { AuthProvider } from './src/context/AuthContext';

// --- NOVI MODULARNI IMPORTI ZA FIREBASE ---
import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  AuthorizationStatus
} from '@react-native-firebase/messaging';

import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

// Expo Notifications Handler (Ovo ostaje isto)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const queryClient = new QueryClient();

export default function App() {

  // 1. SETUP KANALA I DOZVOLA (Modularni stil)
  useEffect(() => {
    async function configurePushNotifications() {
      // Uzimamo instancu messaging-a
      const messaging = getMessaging();

      try {
        // --- PROMENA: Umesto messaging().requestPermission() ---
        const authStatus = await requestPermission(messaging);

        // --- PROMENA: AuthorizationStatus je sada Enum koji smo importovali ---
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          // --- PROMENA: Umesto messaging().getToken() ---
          const token = await getToken(messaging);
          console.log('MOJ FCM TOKEN:', token);
        }
      } catch (error) {
        console.error('Greška pri tokenu:', error);
      }

      // Android Kanal (Ovo ostaje isto)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('gamehubz-alert', {
          name: 'GameHubz Obaveštenja',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          showBadge: true,
        });
      }
    }

    configurePushNotifications();
  }, []);

  // 2. SLUŠALAC PORUKA (Modularni stil)
  useEffect(() => {
    const messaging = getMessaging();

    // --- PROMENA: Umesto messaging().onMessage(...) ---
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      console.log('Stigla poruka, pravim popup...', remoteMessage);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || 'GameHubz',
          body: remoteMessage.notification?.body || 'Nova poruka!',
          data: remoteMessage.data,
          sound: 'default',
        },
        trigger: {
          channelId: 'gamehubz-alert',
          seconds: 1,
        },
      });
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
        <StatusBar style="light" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}