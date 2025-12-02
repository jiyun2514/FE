// src/screens/NicknameEditScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

const NicknameEditScreen = () => {
  const navigation = useNavigation<any>();
  const [nickname, setNickname] = useState('');

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleConfirm = () => {
    // TODO: 닉네임 저장 API 호출이나 전역 상태 업데이트
    // 예: route.params.onChange?.(nickname);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 24 }} />{/* 오른쪽 정렬용 더미 */}
      </View>

      {/* 내용 */}
      <View style={styles.content}>
        {/* 프로필 아이콘 */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <View style={styles.avatarInner} />
          </View>
        </View>

        {/* 카드 영역 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>닉네임 변경하기</Text>

          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="이름"
            placeholderTextColor="#9CA3AF"
          />

          {/* 하단 버튼 2개 */}
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={[styles.bottomButton, styles.bottomLeft]}
              onPress={handleCancel}
            >
              <Text style={styles.bottomButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomButton, styles.bottomRight]}
              onPress={handleConfirm}
            >
              <Text style={styles.bottomButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default NicknameEditScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7ED', // 위쪽은 약간 회색
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    backgroundColor: '#E5E7ED',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#111827',
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  bottomLeft: {
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    borderBottomRightRadius: 8,
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
});
