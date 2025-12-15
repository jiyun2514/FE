// src/screens/ChangePasswordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { auth0, REDIRECT_URI } from '../api/auth';

type Props = {
  navigation: any;
};

export default function ChangePasswordScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleOpenResetPage = async () => {
  if (loading) return;
  setLoading(true);

  try {
    // 1️⃣ 기존 Auth0 세션(SSO) 끊기
    try {
      await auth0.webAuth.clearSession({ federated: true });
    } catch (err) {
      console.log('clearSession error (ignored):', err);
    }

    // 2️⃣ 무조건 로그인 화면 다시 띄우기
    await auth0.webAuth.authorize({
      scope: 'openid profile email',
      redirectUrl: REDIRECT_URI,
      additionalParameters: {
        prompt: 'login',
      },
    });
  } catch (e) {
    console.log('open auth0 login error:', e);
    Alert.alert(
      '오류',
      '비밀번호 재설정 화면으로 이동하는 중 문제가 발생했습니다.',
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* === 헤더 === */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <ChevronLeft color="#2c303c" size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>비밀번호 변경 및 찾기</Text>

          {/* 오른쪽 정렬용 빈 공간 */}
          <View style={{ width: 32 }} />
        </View>

        {/* === 본문 === */}
        <View style={styles.content}>
          <Text style={styles.description}>
            Auth0 로그인 화면에서{'\n'}
            <Text style={{ fontWeight: '600' }}>"Forgot your password?"</Text>를 눌러주세요.
          </Text>

          <Pressable
            style={[
              styles.submitButton,
              loading && { opacity: 0.6 },
            ]}
            onPress={handleOpenResetPage}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              비밀번호 변경 및 찾기
            </Text>
          </Pressable>
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
  root: {
    flex: 1,
    backgroundColor: '#E5E7ED',
  },

  // === ChatScreen과 통일한 헤더 스타일 ===
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#d5d8e0',
    borderBottomWidth: 1,
    borderBottomColor: '#c5c8d4',
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c303c',
  },

  // === 본문 ===
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 24,
  },

  formArea: {
    marginTop: 16,
  },

  inputLabel: {
    fontSize: 12,
    color: '#2c303c',
    marginBottom: 8,
  },

  inputBox: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2c303c',
    marginBottom: 20,
  },

  submitButton: {
    marginTop: 32,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2c303c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 15,
  },
});