// src/screens/LogoutModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth0 } from '../api/auth';

type Props = {
  navigation: any;
};

export default function LogoutModal({ navigation }: Props) {
  const handleLogout = async () => {
    try {
      console.log('[RN] 로그아웃 시작');

      // 1️⃣ Auth0 세션 종료
      try {
        await auth0.webAuth.clearSession();
        console.log('Auth0 세션 종료 완료');
      } catch (e) {
        console.log('Auth0 clearSession 실패(무시 가능):', e);
      }

      // 2️⃣ 앱 저장 토큰 삭제
      await AsyncStorage.clear();
      console.log('AsyncStorage clear 완료');

      // 3️⃣ 로그인 화면으로 이동 (스택 완전 초기화)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (e) {
      console.log('로그아웃 오류:', e);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        
        <Text style={styles.title}>로그아웃</Text>
        <Text style={styles.message}>로그아웃 하시겠습니까?</Text>

        <View style={styles.buttonRow}>
          {/* 취소 */}
          <Pressable
            style={styles.buttonLeft}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>취소</Text>
          </Pressable>

          {/* 확인 = 🔥 진짜 로그아웃 */}
          <Pressable
            style={styles.buttonRight}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: 320,
    paddingTop: 24,
    paddingBottom: 0,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c303c',
    marginBottom: 12,
  },

  message: {
    fontSize: 14,
    color: '#4b4b4b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },

  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#D5D8E0',
  },

  buttonLeft: {
    flex: 1,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderColor: '#D5D8E0',
    alignItems: 'center',
  },

  buttonRight: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c303c',
  },
});
