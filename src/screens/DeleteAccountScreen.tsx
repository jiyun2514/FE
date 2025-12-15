// src/screens/DeleteAccountScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PandaIcon from '../components/PandaIcon';
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'dev-rc5gsyjk5pfptk72.us.auth0.com',
  clientId: 'k1naLtV7ldGAv6ufgUsNe6XlrOQynDpt',   // 🔥 반드시 너네 프로젝트 clientId로 변경해야 함
});

type Props = {
  navigation: any;
};

export default function DeleteAccountScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleReauthenticate = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 🔥 Auth0 Universal Login 재로그인 시도
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email',
        additionalParameters: {
        prompt: 'login',
        }     // 🔥 강제로 로그인 화면을 띄움 (재인증)
      });

      console.log('Re-authenticated:', credentials);

      // 재로그인 성공 = 비밀번호 일치
      navigation.navigate('DeleteAccountModal', {
        accessToken: credentials.accessToken,
      });
    } catch (e: any) {
      console.log('Re-authentication failed', e);
      Alert.alert('인증 실패', '비밀번호가 올바르지 않거나 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        
        {/* 뒤로가기 */}
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        {/* 상단 */}
        <View style={styles.header}>
          <PandaIcon size="large" />
          <Text style={styles.title}>회원 탈퇴</Text>
        </View>

        {/* 안내문 */}
        <Text style={styles.infoText}>
          회원 탈퇴를 진행하시려면{'\n'}
          계정 보호를 위해 다시 한 번 로그인해 주세요.
        </Text>

        {/* 재로그인 버튼 */}
        <Pressable
          style={[styles.deleteButton, loading && { opacity: 0.5 }]}
          onPress={handleReauthenticate}
          disabled={loading}
        >
          <Text style={styles.deleteButtonText}>
            {loading ? '로그인 중...' : '다시 로그인하기'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E5E7ED',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  backArrow: {
    fontSize: 28,
    color: '#2c303c',
    marginBottom: 16,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '600',
    color: '#2c303c',
  },

  card: {
    backgroundColor: '#d5d8e0',
    padding: 20,
    borderRadius: 16,
  },

  label: {
    color: '#2c303c',
    fontSize: 14,
    marginBottom: 8,
  },

  input: {
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2c303c',
    marginBottom: 20,
  },

  deleteButton: {
    backgroundColor: '#2c303c',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
  },

});