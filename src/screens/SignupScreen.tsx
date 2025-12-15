// src/screens/SignupScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PandaIcon from '../components/PandaIcon';
import { ChevronLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth0, REDIRECT_URI } from '../api/auth';

type Props = {
  navigation: any;
};


export default function SignupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [idText, setIdText] = useState('');
  const [pw, setPw] = useState('');
  const [pwCheck, setPwCheck] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (loading) return;

    // 프론트에서 간단히만 체크 (진짜 회원가입은 Auth0가 처리)
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해 주세요.');
      return;
    }
    if (!pw || !pwCheck) {
      Alert.alert('알림', '비밀번호를 입력해 주세요.');
      return;
    }
    if (pw !== pwCheck) {
      Alert.alert('알림', '비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {

      console.log("SIGNUP redirectUrl =", REDIRECT_URI);
      // 🔐 Auth0 Universal Login을 "회원가입 모드"로 오픈
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email',
        redirectUrl: REDIRECT_URI,
        // 이메일 입력값을 Auth0 폼에 미리 넣어주고 싶으면:
        additionalParameters: {
          screen_hint: 'signup', // 👉 회원가입 화면으로 유도
          login_hint: email.trim(),
        },
      });
      

      console.log('[Signup] Auth0 회원가입 + 로그인 성공:', credentials);

      // 토큰 저장 (로그인과 동일한 방식)
      if (credentials.accessToken) {
        await AsyncStorage.setItem('accessToken', credentials.accessToken);
      }
      if (credentials.idToken) {
        await AsyncStorage.setItem('idToken', credentials.idToken);
      }

      // TODO: 필요하면 /api/auth/me 호출해서 내부 userId, subscription 등 저장

      // 회원가입 후 바로 앱 메인으로
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (e: any) {
      console.log('[Signup] Auth0 회원가입 실패:', e);
      Alert.alert(
        '회원가입 실패',
        '회원가입 중 문제가 발생했습니다. 다시 시도해 주세요.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={[styles.safeArea, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* ===== 상단 뒤로가기 버튼 ===== */}
          <View style={styles.topHeader}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={26} color="#2c303c" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* ===== 내용 영역 ===== */}
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>회원가입</Text>

            <View style={styles.card}>
              <View style={styles.logoSection}>
                <View style={styles.logoRow}>
                  <Text style={styles.logoText}>LING</Text>
                  <PandaIcon size="small" />
                  <Text style={styles.logoText}>MATE</Text>
                </View>
                <Text style={styles.desc}>AI와 함께하는 외국어 회화</Text>
              </View>

              {/* 아이디 (앱 내부에서만 쓰고 싶다면 유지, 아니면 없어도 됨) */}
              <TextInput
                style={styles.inputBoxId}
                placeholder="아이디 (선택)"
                placeholderTextColor="#9ca3af"
                value={idText}
                onChangeText={setIdText}
              />

              <TextInput
                style={styles.inputBoxEmail}
                placeholder="이메일"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <TextInput
                style={styles.inputBoxPw}
                placeholder="비밀번호"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={pw}
                onChangeText={setPw}
              />

              <TextInput
                style={styles.inputBoxPwCheck}
                placeholder="비밀번호 확인"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={pwCheck}
                onChangeText={setPwCheck}
              />

              <Pressable
                style={[
                  styles.signupButton,
                  loading && { opacity: 0.6 },
                ]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.signupButtonText}>회원가입</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e5e7ed',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  /* 상단 뒤로가기 */
  topHeader: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },

  /* 카드 영역 전체 (위로 붙이기) */
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // ⬅ 위에서부터 시작
    paddingTop: 24,               // ⬅ 카드 전체를 얼마나 내릴지 여기서 조절
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c303c',
    marginBottom: 12,
  },

  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#d5d8e0',
    borderRadius: 24,
    padding: 24,
  },

  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c303c',
  },
  desc: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },

  inputBoxId: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2c303c',
    marginBottom: 8,
  },
  inputBoxEmail: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2c303c',
    marginBottom: 8,
  },
  inputBoxPw: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2c303c',
    marginBottom: 8,
  },
  inputBoxPwCheck: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2c303c',
    marginBottom: 12,
  },

  signupButton: {
    marginTop: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2c303c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 15,
  },
});