// src/screens/StudyStatsScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PandaIcon from '../components/PandaIcon';
import { statsApi } from '../api/stats';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  navigation: any;
};

type StatsData = {
  totalSessions: number;
  totalMinutes: number;
  avgScore: number;
  bestScore: number;
  streak: number;
  newWordsLearned: number;
};

// ===== 로컬 통계 키 (ChatScreen과 동일해야 함) =====
const STATS_KEYS = {
  totalMinutes: 'local_stats_totalMinutes',
  streak: 'local_stats_streak',
  lastStudyDate: 'local_stats_lastStudyDate',
  totalSentences: 'local_stats_totalSentences',
  learnedSet: 'local_stats_learnedSentenceSet',
};

export default function StudyStatsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ 응답 구조가 달라도 최대한 Stats payload를 뽑아내는 함수
  const extractStatsPayload = (raw: any) => {
    return raw?.data?.data ?? raw?.data ?? raw?.stats ?? raw;
  };

  const readLocalStats = async () => {
    const totalMinutes = Number((await AsyncStorage.getItem(STATS_KEYS.totalMinutes)) ?? '0');
    const streak = Number((await AsyncStorage.getItem(STATS_KEYS.streak)) ?? '0');
    const totalSentences = Number((await AsyncStorage.getItem(STATS_KEYS.totalSentences)) ?? '0');

    return { totalMinutes, streak, totalSentences };
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);

    try {
      console.log('[StudyStats] fetchStats 호출');

      const res = await statsApi.getStats();

      console.log('[StudyStats] /api/stats 원본 응답:', JSON.stringify(res.data, null, 2));

      const payload = extractStatsPayload(res.data);

      console.log('[StudyStats] /api/stats payload:', JSON.stringify(payload, null, 2));

      // 서버 값(없으면 0)
      const serverStats: StatsData = {
        totalSessions: payload?.totalSessions ?? 0,
        totalMinutes: payload?.totalMinutes ?? 0,
        avgScore: payload?.avgScore ?? 0,
        bestScore: payload?.bestScore ?? 0,
        streak: payload?.streak ?? 0,
        newWordsLearned: payload?.newWordsLearned ?? 0,
      };

      // ✅ 로컬 값 읽기
      const local = await readLocalStats();

      // ✅ fallback 규칙:
      // - 서버 값이 0이면(미구현/미반영 상태) 로컬로 대체
      // - 서버가 나중에 제대로 들어오면(0이 아니면) 서버가 우선
      const merged: StatsData = {
        ...serverStats,
        totalMinutes: serverStats.totalMinutes > 0 ? serverStats.totalMinutes : local.totalMinutes,
        streak: serverStats.streak > 0 ? serverStats.streak : local.streak,
        newWordsLearned:
          serverStats.newWordsLearned > 0 ? serverStats.newWordsLearned : local.totalSentences,
      };

      console.log('[StudyStats] merged stats:', merged);
      setStats(merged);
    } catch (err: any) {
      console.log('[StudyStats] /api/stats 호출 실패');
      console.log(' - status:', err?.response?.status);
      console.log(' - data:', JSON.stringify(err?.response?.data, null, 2));
      console.log(' - message:', err?.message);

      // 서버 실패하면 로컬로라도 보여주기
      const local = await readLocalStats();

      setStats({
        totalSessions: 0,
        totalMinutes: local.totalMinutes,
        avgScore: 0,
        bestScore: 0,
        streak: local.streak,
        newWordsLearned: local.totalSentences,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats]),
  );

  // 총 학습 시간: 분 → xxh xxm
  const getTotalHoursLabel = () => {
    if (!stats) return '-';
    const hours = Math.floor(stats.totalMinutes / 60);
    const minutes = stats.totalMinutes % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const formatScore = (value: number) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '-';
    return Math.round(value).toString();
  };

  // 3회마다 팬더 1개, 최대 12개
  const getPandaCount = () => {
    if (!stats) return 0;
    const count = Math.floor(stats.totalSessions / 3);
    return Math.min(count, 12);
  };

  const pandaCount = getPandaCount();

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <View
          style={[
            styles.root,
            {
              paddingTop: insets.top,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <ActivityIndicator size="large" color="#2c303c" />
          <Text style={{ marginTop: 12, color: '#4b4b4b' }}>
            학습 통계를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* ===== 헤더 ===== */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>학습 통계</Text>

          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ===== 요약 카드 6개 ===== */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{stats.totalSessions}</Text>
              <Text style={styles.summaryLabel}>총 대화 횟수</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{getTotalHoursLabel()}</Text>
              <Text style={styles.summaryLabel}>총 학습 시간</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{formatScore(stats.avgScore)}</Text>
              <Text style={styles.summaryLabel}>평균 점수</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{stats.streak}</Text>
              <Text style={styles.summaryLabel}>연속 학습일</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{formatScore(stats.bestScore)}</Text>
              <Text style={styles.summaryLabel}>최고 점수</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{stats.newWordsLearned}</Text>
              <Text style={styles.summaryLabel}>학습한 단어 및 문장</Text>
            </View>
          </View>

          {/* ===== 진행도 & 뱃지 ===== */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>진행도</Text>
            <Text style={styles.progressHint}>
              하루 3회 이상 대화 시 10포인트 (3회마다 팬더 1개)
            </Text>

            <View style={styles.badgeRow}>
              {[0, 1, 2, 3].map(idx => (
                <View key={idx} style={styles.badgeBox}>
                  {idx < pandaCount && <PandaIcon size="medium" />}
                </View>
              ))}
            </View>

            <View style={styles.badgeRow}>
              {[4, 5, 6, 7].map(idx => (
                <View key={idx} style={styles.badgeBox}>
                  {idx < pandaCount && <PandaIcon size="medium" />}
                </View>
              ))}
            </View>

            <View style={styles.badgeRow}>
              {[8, 9, 10, 11].map(idx => (
                <View key={idx} style={styles.badgeBox}>
                  {idx < pandaCount && <PandaIcon size="medium" />}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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

  // ===== 헤더 (다른 화면과 통일) =====
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
  backIcon: {
    fontSize: 22,
    color: '#2c303c',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c303c',
    textAlign: 'center',
  },

  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    rowGap: 24,
  },

  // ===== 요약 카드 =====
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  summaryCard: {
    width: '48%',
    height: 90,
    backgroundColor: 'rgba(191,195,208,0.5)',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 13,
    color: '#111827',
  },

  // ===== 진행도 & 뱃지 =====
  progressSection: {
    marginTop: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  progressHint: {
    fontSize: 12,
    color: '#6A6E79',
    marginBottom: 12,
    textAlign: 'right',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeBox: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(191,195,208,0.5)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
