// src/screens/SettingsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

export default function SettingsScreen({ navigation }: any) {
  const [pushEnabled, setPushEnabled] = useState(false);
  const insets = useSafeAreaInsets();

  const togglePush = () => {
    setPushEnabled(prev => !prev);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={[styles.root, { paddingTop: insets.top }]}>

        {/* ===== 공통 헤더 ===== */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#2c303c" />
          </Pressable>

          <Text style={styles.headerTitle}>설정</Text>

          <View style={{ width: 32 }} />
        </View>

        {/* ================= 프로필 영역 ================= */}
        <View style={styles.profileSection}>
          <View style={styles.profileCircle} />
          <Text style={styles.profileSubtitle}>사진 변경</Text>
        </View>

        {/* ================= 이름 영역 ================= */}
        <View style={styles.nameRow}>
          <Text style={styles.nameLabel}>이름</Text>
          <Pressable onPress={() => navigation.navigate('NicknameEdit')}>
            <Text style={styles.nameAction}>변경하기</Text>
          </Pressable>
        </View>

        <View style={styles.nameDivider} />

        {/* ================= 카드 리스트 ================= */}
        <View style={styles.cardsContainer}>
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.cardLabel}>비밀번호 변경</Text>
          </Pressable>

          <Pressable style={styles.card} onPress={togglePush}>
            <Text style={styles.cardLabel}>푸시 알림</Text>

            <View
              style={[
                styles.toggleTrack,
                pushEnabled && styles.toggleTrackOn,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  pushEnabled && styles.toggleThumbOn,
                ]}
              />
            </View>
          </Pressable>

          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={styles.cardLabel}>구독</Text>
          </Pressable>

          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('AccountManage')}
          >
            <Text style={styles.cardLabel}>계정 관리</Text>
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

  /* ===== 헤더 ===== */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#d5d8e0',
    borderBottomWidth: 1,
    borderBottomColor: '#c5c8d4',
  },
  backButton: {
    width: 32,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c303c',
  },

  /* ===== 프로필 ===== */
  profileSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  profileCircle: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: '#2c303c',
    marginBottom: 12,
  },
  profileSubtitle: {
    fontSize: 15,
    color: '#6A6E79',
  },

  /* ===== 이름 row ===== */
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  nameLabel: {
    fontSize: 17,
    color: '#2c303c',
  },
  nameAction: {
    fontSize: 17,
    color: '#6A6E79',
  },
  nameDivider: {
    height: 1,
    backgroundColor: '#6A6E79',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },

  /* ===== 카드 ===== */
  cardsContainer: {
    paddingHorizontal: 20,
    rowGap: 12,
    marginTop: 60,
  },

  card: {
    width: '100%',
    height: 61,
    backgroundColor: 'rgba(191, 195, 208, 0.5)',
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  cardLabel: {
    fontSize: 17,
    color: '#2c303c',
  },

  /* ===== 토글 ===== */
  toggleTrack: {
    width: 36,
    height: 20,
    backgroundColor: '#D2D5DA',
    borderRadius: 10,
    position: 'absolute',
    right: 20,
    top: 20,
  },
  toggleTrackOn: {
    backgroundColor: '#2c303c',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    position: 'absolute',
    left: 2,
    top: 2,
  },
  toggleThumbOn: {
    left: 18,
  },
});
