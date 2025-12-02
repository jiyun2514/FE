// src/screens/ReviewScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

// 데이터 타입 정의
type CardItem = {
  en: string;
  kr: string;
};

export default function ReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>(); // 파라미터를 받기 위해 useRoute 사용
  const insets = useSafeAreaInsets();

  // ✅ ChatScreen에서 넘겨준 reviewCards 데이터를 받음
  // 데이터가 없을 경우(그냥 들어왔을 때 등)를 대비해 빈 배열([])을 기본값으로 설정
  const reviewCards: CardItem[] = route.params?.reviewCards || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        
        {/* ===== 통일된 헤더 ===== */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color="#2c303c" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>복습하기</Text>

          {/* 오른쪽 공간 (정렬 유지용) */}
          <View style={{ width: 32 }} />
        </View>

        {/* 카드 리스트 */}
        <ScrollView
          contentContainerStyle={styles.cardList}
          showsVerticalScrollIndicator={false}
        >
          {reviewCards.length > 0 ? (
            // 데이터가 있을 때 출력
            reviewCards.map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.cardBg} />
                <View style={styles.cardContentRow}>
                  <Text style={styles.cardTextEn}>{item.en}</Text>
                  <Text style={styles.cardTextKr}>{item.kr}</Text>
                </View>
              </View>
            ))
          ) : (
            // 데이터가 없을 때 표시할 화면 (예외 처리)
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                추출된 표현이 없거나 대화 내역이 없습니다.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* 하단 버튼 두 개 */}
        <View style={styles.bottomButtonsRow}>
          {/* 스크립트 → ChatScript 화면 */}
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate('Script')}
          >
            <Text style={styles.btnText}>스크립트</Text>
          </TouchableOpacity>

          {/* 홈으로 → HomeScreen 화면 */}
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.btnText}>홈으로</Text>
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

  /* ===== 통일된 헤더 스타일 ===== */
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
    height: 32,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c303c',
    textAlign: 'center',
  },

  /* 카드 리스트 */
  cardList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    rowGap: 12,
    marginTop: 12,
  },
  card: {
    width: '100%',
    minHeight: 61, // 내용이 길어질 수 있으므로 minHeight로 변경 권장
    justifyContent: 'center',
    marginVertical: 4, // 카드 간 간격 미세 조정
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(191,195,208,0.5)',
    borderRadius: 15,
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12, // 텍스트 상하 여백 확보
  },
  cardTextEn: {
    fontSize: 16, // 긴 문장 고려하여 약간 조절
    fontWeight: '500', // 가독성을 위해 굵기 조절
    color: '#000',
    flex: 1, // 텍스트가 길 경우 줄바꿈 되도록
    marginRight: 10,
  },
  cardTextKr: {
    fontSize: 15,
    fontWeight: '400',
    color: '#4B5563', // 약간 연한 색으로 구분
    maxWidth: '40%', // 한국어 뜻이 너무 길지 않게 제한
    textAlign: 'right',
  },

  /* 데이터 없음 예외 처리 스타일 */
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },

  /* 하단 버튼 영역 */
  bottomButtonsRow: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  btn: {
    width: 120,
    height: 40,
    backgroundColor: '#2C303C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    color: '#D5D8E0',
  },
});