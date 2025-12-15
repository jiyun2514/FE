// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PandaIcon from '../components/PandaIcon';
import { homeApi } from '../api/Services';
import client from '../api/Client';

type Props = {
  navigation: any;
};

// src/screens → src/assets 로 가는 경로: ../assets/...
const pandaImg = require('../assets/images/panda-mascot.png');
const DAILY_LIMIT = 3; // 하루 최대 학습(스탬프) 횟수

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();


  // 홈 상태
  const [todayCount, setTodayCount] = useState<number>(0);
  const [subscription, setSubscription] =
    useState<'basic' | 'premium'>('basic');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHomeStatus = async () => {
      try {
        const res = await homeApi.getStatus();
        const data = res.data.data; // ApiResponse<T> 구조에서 data 꺼내기

        if (data) {
          setTodayCount(data.todayConversationCount);
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('홈 상태 불러오기 실패:', error);
        // 실패 시 기본값(0회, basic) 유지
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeStatus();
  }, []);

  // 판다 스탬프 & 텍스트 계산
  const isPremium = subscription === 'premium';
  const filledCount = Math.min(todayCount, DAILY_LIMIT);

  let progressText = '';
  if (isLoading) {
    progressText = '불러오는 중...';
  } else if (isPremium) {
    // 프리미엄: 실제 학습 횟수 그대로 표시
    progressText = `${todayCount}회 학습`;
  } else {
    // 일반 유저: 남은 횟수 (최대 3회)
    const remaining = Math.max(DAILY_LIMIT - todayCount, 0);
    progressText = `${remaining}회 남음`;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 32,    // ← 화면 전체를 자연스럽게 아래로 내리는 핵심 부분
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - LING(팬다)MATE 로고 */}
          <View style={styles.headerWrapper}>
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>LING</Text>
              <PandaIcon size="small" />
              <Text style={styles.logoText}>MATE</Text>
            </View>
          </View>

          {/* Greeting */}
          <View style={styles.greeting}>
            <Text style={styles.greetingTitle}>안녕하세요!</Text>
            <Text style={styles.greetingSubtitle}>
              오늘도 열심히 학습해볼까요.
            </Text>
          </View>

          {/* 오늘의 학습 카드 */}
          <View style={styles.todayCard}>
            <Text style={styles.cardTitle}>오늘의 학습</Text>

            {/* Panda progress */}
            <View style={styles.pandaProgressRow}>
              {[0, 1, 2].map((idx) => {
                const isFilled = idx < filledCount;

                return (
                  <View
                    key={idx}
                    style={[
                      styles.pandaCircle,
                      !isFilled && styles.pandaCircleDisabled,
                    ]}
                  >
                    <Image
                      source={pandaImg}
                      style={[
                        styles.pandaIcon,
                        !isFilled && styles.pandaIconDim,
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            <Text style={styles.progressText}>{progressText}</Text>
          </View>

          {/* AI와 회화 시작 카드 */}
          <View style={styles.chatCard}>
            <View style={styles.chatPandaWrapper}>
              <View style={styles.chatPandaCircle}>
                <PandaIcon size="medium" />
              </View>
            </View>

            <View style={styles.chatTextBlock}>
              <Text style={styles.chatTitle}>AI와 회화 시작하기</Text>
              <Text style={styles.chatSubtitle}>
                새로운 회화를 시작해보세요.
              </Text>
            </View>

            <View style={styles.chatButtonsRow}>
              <Pressable
                style={styles.chatButton}
                onPress={() =>
                  navigation.navigate('ChatSettings', {
                    initialMode: 'casual',
                  })
                }
              >
                <Text style={styles.chatButtonText}>😊 Casual</Text>
              </Pressable>

              <Pressable
                style={styles.chatButton}
                onPress={() =>
                  navigation.navigate('ChatSettings', {
                    initialMode: 'formal',
                  })
                }
              >
                <Text style={styles.chatButtonText}>🎓 Formal</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <View
            style={[
              styles.bottomNavInner,
              { paddingBottom: insets.bottom },
            ]}
          >
            <Pressable style={styles.bottomNavItem}>
              <Text style={styles.bottomNavIcon}>🏠</Text>
              <Text style={styles.bottomNavLabelActive}>홈</Text>
            </Pressable>

            <Pressable
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate('StudyStats')}
            >
              <Text style={styles.bottomNavIconInactive}>📊</Text>
              <Text style={styles.bottomNavLabelInactive}>통계</Text>
            </Pressable>

            <Pressable
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.bottomNavIconInactive}>👤</Text>
              <Text style={styles.bottomNavLabelInactive}>마이</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8eaf0',
  },
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  headerWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c303c',
  },

  greeting: {
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c303c',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },

  todayCard: {
    backgroundColor: '#d5d8e0',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c303c',
    marginBottom: 16,
  },

  pandaProgressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  pandaCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pandaCircleDisabled: {
    backgroundColor: '#c5c8d4',
    opacity: 0.4,
  },
  pandaIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  pandaIconDim: {
    opacity: 0.9,
  },
  progressText: {
    marginTop: 8,
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },

  chatCard: {
    backgroundColor: '#d5d8e0',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  chatPandaWrapper: {
    marginBottom: 16,
  },
  chatPandaCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#2c303c',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chatTextBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c303c',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },

  chatButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  chatButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#2c303c',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 15,
  },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#4a4f5e',
    borderTopWidth: 1,
    borderTopColor: '#3d424f',
  },
  bottomNavInner: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  bottomNavItem: {
    alignItems: 'center',
    gap: 2,
  },
  bottomNavIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  bottomNavIconInactive: {
    fontSize: 18,
    color: '#9ca3af',
  },
  bottomNavLabelActive: {
    fontSize: 12,
    color: '#ffffff',
  },
  bottomNavLabelInactive: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
