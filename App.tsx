// App.tsx

import React, { createContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { authorize, revoke } from 'react-native-app-auth';
import { jwtDecode } from 'jwt-decode';

// Import your existing Auth0 config
import { authConfig } from './src/auth/authConfig';

// Screens...
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

// ======================================================
// 🔐 Auth Context (now includes userId)
// ======================================================
export const AuthContext = createContext({
  accessToken: null as string | null,
  userId: null as string | null,   // ← MUST EXIST
  login: async () => {},
  logout: async () => {},
});


// ======================================================
// 🔐 Auth Provider
// ======================================================
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const config = {
    issuer: `https://${authConfig.domain}`,
    clientId: authConfig.clientId,
    redirectUrl: authConfig.redirectUri,
    scopes: ['openid', 'profile', 'email'],
    serviceConfiguration: {
      authorizationEndpoint: `https://${authConfig.domain}/authorize`,
      tokenEndpoint: `https://${authConfig.domain}/oauth/token`,
      revocationEndpoint: `https://${authConfig.domain}/oauth/revoke`,
    },
  };

  const login = async () => {
    try {
      const result = await authorize(config);
      setAccessToken(result.accessToken);

      if (result.idToken) {
        const decoded: any = jwtDecode(result.idToken);
        setUserId(decoded.sub);   // ← THIS IS YOUR AUTH0 USER ID
      }
    } catch (err) {
      console.error("Auth0 Login Error:", err);
    }
  };

  const logout = async () => {
    try {
      setAccessToken(null);
      setUserId(null);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  // ⭐ THIS is the part you replace
  return (
    <AuthContext.Provider 
      value={{ 
        accessToken, 
        userId, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// ======================================================
// Navigation
// ======================================================
const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash">

            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Review" component={ReviewScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="StudyStats" component={StudyStatsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SubscriptionSimple" component={SubscriptionSimpleScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: false }} />

            {/* Modals */}
            <Stack.Screen name="PremiumSubscribeModal" component={PremiumSubscribeModal} options={{ presentation: 'transparentModal', headerShown: false }} />
            <Stack.Screen name="PremiumCancelModal" component={PremiumCancelModal} options={{ presentation: 'transparentModal', headerShown: false }} />
            <Stack.Screen name="AccountManage" component={AccountManageScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LogoutModal" component={LogoutModal} options={{ presentation: 'transparentModal', headerShown: false }} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DeleteAccountModal" component={DeleteAccountModal} options={{ presentation: 'transparentModal', headerShown: false }} />

            <Stack.Screen name="ChatSettings" component={ChatSettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Script" component={ChatScript} options={{ headerShown: false }} />

          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
