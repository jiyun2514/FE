// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PandaIcon from '../components/PandaIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth0, authApi, REDIRECT_URI } from '../api/auth';
import { setAccessToken } from '../api/Client';


type Props = {
  navigation: any;
};

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  // handleLogin 내부만 교체
const handleLogin = async () => {
  if (loading) return;
  setLoading(true);

  try {
    const credentials = await auth0.webAuth.authorize({
      scope: 'openid profile email',
      audience: 'https://api.lingomate.com',
      redirectUrl: REDIRECT_URI,
    });

    await AsyncStorage.setItem('accessToken', credentials.accessToken);
    setAccessToken(credentials.accessToken); 

    if (credentials.idToken) {
      await AsyncStorage.setItem('idToken', credentials.idToken);
    }

    try {
      const me = await authApi.getMyAuthInfo();
      console.log("유저 자동 생성 성공:", me.data);
    } catch (err) {
      console.log("/api/auth/me 실패:", err);
    }

    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  } catch (e) {
    console.log('Auth0 로그인 실패:', e);
    Alert.alert('로그인 실패', '다시 시도해주세요.');
  } finally {
    setLoading(false);
  }
};
  /*
  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      console.log("SIGNUP redirectUrl =", REDIRECT_URI);
      // 1️⃣ Auth0 Universal Login 띄우기 (이메일/비번, 소셜 로그인 포함)
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email',
        audience: 'https://api.lingomate.com',
        redirectUrl: REDIRECT_URI,
        // 필요한 경우 additionalParameters에 값 추가 가능
        // additionalParameters: { prompt: 'login' },
      });

      console.log('Auth0 로그인 성공:', credentials);

      // 🔑 토큰 저장
      if (credentials.accessToken) {
        await AsyncStorage.setItem('accessToken', credentials.accessToken);
        setAccessToken(credentials.accessToken);
      }
      if (credentials.idToken) {
        await AsyncStorage.setItem('idToken', credentials.idToken);
      }

      try {
        const syncRes = await authApi.registerIfNeeded();
        console.log('User synced:', syncRes.data);
      } catch (err) {
        console.log('register-if-needed 호출 실패:', err);
      }

      // 🔥 백엔드 /auth/me 호출 (선택)
      try {
        const meRes: any = await authApi.getMyAuthInfo();
        console.log('백엔드 /auth/me:', meRes);
      } catch (e) {
        console.log('/api/auth/me 호출 실패:', e);
      }

      // 홈 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (e) {
      console.log('Auth0 로그인 실패:', e);
      Alert.alert('로그인 실패', '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  */
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* 상단 로고 */}
        <View style={styles.header}>
          <PandaIcon size="large" />
          <Text style={styles.title}>LingoMate</Text>
          <Text style={styles.subTitle}>영어 회화를 쉽고 자연스럽게</Text>
        </View>


        {/* 로그인 버튼 */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.loginButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>로그인 / 회원가입</Text>
            )}
          </Pressable>

          <Text style={styles.smallText}>
            로그인은 Auth0 보안 페이지에서 처리되며,{'\n'}
            비밀번호는 앱이나 서버에 저장되지 않습니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E5E7ED',
  },

  footer: {
  marginBottom: 40,
},


  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  backArrow: {
    fontSize: 28,
    color: '#2C303C',
    marginBottom: 20,
  },

  header: {
    flex: 1,                 // ⬅⬅ 화면 공간 크게 가져오기
    justifyContent: 'center', // ⬅⬅ 세로 가운데
    alignItems: 'center',      // ⬅⬅ 가로 가운데
    marginBottom: 0, 
  },

  title: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#2C303C',
  },

  subTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

  body: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    flex: 0,
  },

  description: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: '#2C303C',
    marginBottom: 40,
  },

  card: {
    backgroundColor: '#D5D8E0',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    marginTop: 12,
  },

  label: {
    color: '#2C303C',
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },

  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#2C303C',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C5C8D4',
  },

  loginButton: {
    backgroundColor: '#2C303C',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  smallText: {
  marginTop: 12,
  fontSize: 12,
  color: '#6B7280',
  textAlign: 'center',
  lineHeight: 18,
},
});