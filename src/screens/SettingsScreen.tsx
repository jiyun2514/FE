// src/screens/SettingsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { notificationsApi } from '../api/notifications';

const pandaImg = require('../assets/images/panda-mascot.png');

export default function SettingsScreen({ navigation }: any) {
  const [pushEnabled, setPushEnabled] = useState(false);

  // 🔹 프로필 데이터
  const [userName, setUserName] = useState<string>('사용자');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const insets = useSafeAreaInsets();

  // ✅ 서버에 저장까지 하는 토글
  const togglePush = async () => {
    const next = !pushEnabled;

    // UI 먼저 반응
    setPushEnabled(next);

    try {
      const res = await notificationsApi.updateSettings(next);
      const saved = !!res.data?.data?.enabled;
      setPushEnabled(saved); // 서버 값으로 확정
    } catch (e) {
      console.log('알림 설정 저장 실패:', e);
      // 실패하면 원복
      setPushEnabled(!next);
      Alert.alert('오류', '알림 설정 저장에 실패했어요.');
    }
  };

  // 🔹 앱 시작 & 화면 진입 시 한번 불러오기
  useEffect(() => {
    const loadAll = async () => {
      try {
        // 1) 프로필(로컬)
        const storedName = await AsyncStorage.getItem('userName');
        const storedAvatar = await AsyncStorage.getItem('userAvatarUri');

        if (storedName) setUserName(storedName);
        if (storedAvatar) setAvatarUri(storedAvatar);

        // 2) 알림 설정(서버)
        const res = await notificationsApi.getSettings();
        const enabled = !!res.data?.data?.enabled;
        setPushEnabled(enabled);
      } catch (e) {
        console.log('설정 불러오기 실패:', e);
      }
    };

    loadAll();
  }, []);

  // 🔹 이름 저장 함수
  const saveName = async (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('알림', '이름을 비워둘 수 없어요.');
      return;
    }

    try {
      await AsyncStorage.setItem('userName', trimmed);
    } catch (e) {
      console.log('이름 저장 실패:', e);
    }
  };

  // 🔹 이미지 선택 함수
  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      (response) => {
        handleImageResponse(response); // async 함수는 분리해야 함
      }
    );
  };

  // 🔹 실제 async 처리 (콜백에서는 async 쓰면 에러)
  const handleImageResponse = async (response: any) => {
    if (response.didCancel) return;

    if (response.errorCode) {
      Alert.alert('오류', '이미지를 불러오지 못했어요.');
      return;
    }

    const asset = response?.assets?.[0];
    if (asset?.uri) {
      setAvatarUri(asset.uri);

      try {
        await AsyncStorage.setItem('userAvatarUri', asset.uri);
      } catch (e) {
        console.log('사진 저장 실패:', e);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={[styles.root, { paddingTop: insets.top }]}>

        {/* ===== 헤더 ===== */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#2c303c" />
          </Pressable>

          <Text style={styles.headerTitle}>설정</Text>

          <View style={{ width: 32 }} />
        </View>

        {/* ===== 프로필 사진 ===== */}
        <View style={styles.profileSection}>
          <Pressable style={styles.profileAvatarWrapper} onPress={pickImage}>
            <Image
              source={avatarUri ? { uri: avatarUri } : pandaImg}
              style={styles.profileAvatar}
            />
          </Pressable>

          <Text style={styles.profileName}>{userName}</Text>

          <Pressable onPress={pickImage}>
            <Text style={styles.profileSubtitle}>사진 변경</Text>
          </Pressable>
        </View>

        {/* ===== 이름 ===== */}
        <View style={styles.nameRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nameLabel}>이름</Text>

            {isEditingName ? (
              <TextInput
                style={styles.nameInput}
                value={userName}
                onChangeText={setUserName}
                autoFocus
                returnKeyType="done"
                placeholder="이름을 입력하세요"
                placeholderTextColor="#A0A4AF"
                onBlur={() => {
                  saveName(userName);
                  setIsEditingName(false);
                }}
                onSubmitEditing={() => {
                  saveName(userName);
                  setIsEditingName(false);
                }}
              />
            ) : (
              <Text style={styles.nameValue}>{userName}</Text>
            )}
          </View>

          {!isEditingName && (
            <Pressable onPress={() => setIsEditingName(true)}>
              <Text style={styles.nameAction}>변경하기</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.nameDivider} />

        {/* ===== 카드 섹션 ===== */}
        <View style={styles.cardsContainer}>
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.cardLabel}>비밀번호 변경 및 찾기</Text>
          </Pressable>

          <Pressable style={styles.card} onPress={togglePush}>
            <Text style={styles.cardLabel}>푸시 알림</Text>

            <View style={[styles.toggleTrack, pushEnabled && styles.toggleTrackOn]}>
              <View
                style={[styles.toggleThumb, pushEnabled && styles.toggleThumbOn]}
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

/* ============================= 스타일 ============================= */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E5E7ED' },
  root: { flex: 1, backgroundColor: '#E5E7ED' },

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
  backButton: { width: 32, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#2c303c' },

  profileSection: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  profileAvatarWrapper: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 3,
    borderColor: '#2c303c',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatar: { width: 64, height: 64, resizeMode: 'contain' },
  profileName: { fontSize: 17, fontWeight: '600', color: '#2c303c', marginBottom: 4 },
  profileSubtitle: { fontSize: 15, color: '#6A6E79', textDecorationLine: 'underline' },

  nameRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, alignItems: 'center' },
  nameLabel: { fontSize: 14, color: '#6A6E79', marginBottom: 2 },
  nameValue: { fontSize: 17, color: '#2c303c' },
  nameInput: {
    marginTop: 4,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C2C5D0',
    paddingHorizontal: 10,
    backgroundColor: '#F4F5F9',
    fontSize: 16,
    color: '#2c303c',
  },
  nameAction: { fontSize: 17, color: '#6A6E79' },
  nameDivider: { height: 1, backgroundColor: '#6A6E79', marginHorizontal: 20, marginTop: 8, marginBottom: 20 },

  cardsContainer: { paddingHorizontal: 20, rowGap: 12, marginTop: 60 },
  card: {
    width: '100%',
    height: 61,
    backgroundColor: 'rgba(191, 195, 208, 0.5)',
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  cardLabel: { fontSize: 17, color: '#2c303c' },

  toggleTrack: {
    width: 36,
    height: 20,
    backgroundColor: '#D2D5DA',
    borderRadius: 10,
    position: 'absolute',
    right: 20,
    top: 20,
  },
  toggleTrackOn: { backgroundColor: '#2c303c' },
  toggleThumb: {
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    position: 'absolute',
    left: 2,
    top: 2,
  },
  toggleThumbOn: { left: 18 },
});
