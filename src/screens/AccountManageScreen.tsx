// src/screens/AccountManageScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

type Props = {
  navigation: any;
};

export default function AccountManageScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']}   // 상단은 insets.top으로 처리
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* === ChatScreen과 동일 스타일의 헤더 === */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <ChevronLeft color="#2c303c" size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>계정 관리</Text>

          {/* 오른쪽 정렬용 더미 (ChatScreen처럼) */}
          <View style={{ width: 24 }} />
        </View>

        {/* ===== 옵션 리스트 ===== */}
        <View style={styles.content}>
          {/* 로그아웃 */}
          <TouchableOpacity
            style={styles.itemBox}
            onPress={() => navigation.navigate('LogoutModal')}
          >
            <Text style={styles.itemText}>로그아웃</Text>
            <Text style={styles.arrow}>{'›'}</Text>
          </TouchableOpacity>

          {/* 탈퇴하기 */}
          <TouchableOpacity
            style={styles.itemBox}
            onPress={() => navigation.navigate('DeleteAccount')}
          >
            <Text style={styles.itemText}>탈퇴하기</Text>
            <Text style={styles.arrow}>{'›'}</Text>
          </TouchableOpacity>
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

  // === ChatScreen이랑 맞춘 헤더 스타일 ===
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

  // 내용 영역
  content: {
    marginTop: 20,
    paddingHorizontal: 20,
    rowGap: 16,
  },
  itemBox: {
    width: '100%',
    height: 60,
    borderRadius: 15,
    backgroundColor: 'rgba(191,195,208,0.5)',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 17,
    color: '#2c303c',
  },
  arrow: {
    fontSize: 22,
    color: '#2c303c',
  },
});