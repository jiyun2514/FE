// src/screens/PremiumCancelModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Platform } from 'react-native';

type Props = {
  navigation: any;
};

export default function PremiumCancelModal({ navigation }: Props) {
  const openSubscriptionManagement = () => {
    if (Platform.OS === 'android') {
      // 🔥 구글 플레이 구독 관리 페이지 열기
      Linking.openURL(
        'https://play.google.com/store/account/subscriptions'
      );
    } else {
      // iOS
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    }

    navigation.goBack(); // 팝업 닫기
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        <Text style={styles.title}>프리미엄 구독 취소</Text>

        <Text style={styles.message}>
          프리미엄 회원 구독 취소 시 회화 시간 10분,
          {'\n'}
          일 회화 횟수 3번으로 제한됩니다.
          {'\n'}
          {'\n'}
          구독을 취소하시겠습니까?
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.buttonLeft}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>취소</Text>
          </Pressable>

          <Pressable
            style={styles.buttonRight}
            onPress={openSubscriptionManagement}
          >
            <Text style={styles.buttonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 화면 전체 어둡게
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 가운데 카드
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