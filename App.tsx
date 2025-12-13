// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { setAccessToken } from './src/api/Client';
import { authApi } from './src/api/auth'; // ✅ add this

// Screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/login';
import ProfileScreen from './src/screens/Profile';
import SplashScreen from './src/screens/SplashScreen';
import SignupScreen from './src/screens/SignupScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StudyStatsScreen from './src/screens/StudyStatsScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import SubscriptionSimpleScreen from './src/screens/SubscriptionSimpleScreen';
import PremiumSubscribeModal from './src/screens/PremiumSubscribeModal';
import PremiumCancelModal from './src/screens/PremiumCancelModal';
import AccountManageScreen from './src/screens/AccountManageScreen';
import DeleteAccountScreen from './src/screens/DeleteAccountScreen';
import DeleteAccountModal from './src/screens/DeleteAccountModal';
import LogoutModal from './src/screens/LogoutModal';
import ReviewScreen from './src/screens/ReviewScreen';
import ChatSettingsScreen from './src/screens/chatSettingScreen';
import ChatScreen from './src/screens/ChatScreen';
import ChatScript from './src/screens/ChatScript';
import ChatHistoryScreen from './src/screens/ChatHistoryScreen';
import ReviewHistoryScreen from './src/screens/ReviewHistoryScreen';

const Stack = createNativeStackNavigator();

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');

        if (token) {
          // ✅ 1) attach token to axios
          await setAccessToken(token);

          // ✅ 2) ensure this Auth0 user exists in DB
          // (safe to call every app start)
          try {
            await authApi.registerIfNeeded();
            console.log('✅ register-if-needed OK');
          } catch (e: any) {
            console.log('❌ register-if-needed failed (token may be invalid). Clearing token.');

            // If token expired/invalid, remove it so Splash can route to Login
            await setAccessToken(null);
            await AsyncStorage.removeItem('accessToken');
          }
        }
      } finally {
        setReady(true);
      }
    };

    init();
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Review"
            component={ReviewScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ChatHistory"
            component={ChatHistoryScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="StudyStats"
            component={StudyStatsScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="SubscriptionSimple"
            component={SubscriptionSimpleScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            options={{ headerShown: false }}
          />

          {/* ===== Modals ===== */}
          <Stack.Screen
            name="PremiumSubscribeModal"
            component={PremiumSubscribeModal}
            options={{
              presentation: 'transparentModal',
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />

          <Stack.Screen
            name="PremiumCancelModal"
            component={PremiumCancelModal}
            options={{
              presentation: 'transparentModal',
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />

          <Stack.Screen
            name="AccountManage"
            component={AccountManageScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="LogoutModal"
            component={LogoutModal}
            options={{
              presentation: 'transparentModal',
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />

          <Stack.Screen
            name="DeleteAccount"
            component={DeleteAccountScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="DeleteAccountModal"
            component={DeleteAccountModal}
            options={{
              presentation: 'transparentModal',
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />

          <Stack.Screen
            name="ChatSettings"
            component={ChatSettingsScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Script"
            component={ChatScript}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ReviewHistory"
            component={ReviewHistoryScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
