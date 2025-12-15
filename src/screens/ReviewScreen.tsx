// src/screens/ReviewScreen.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CardItem = {
  corrected: string;
  explanation: string;
  type: "feedback" | "suggestion";
};

type SavedReviewSet = {
  id: string;
  createdAt: number;
  cards: CardItem[];
};

const STORAGE_KEY = "review_history_v1";

// ✅ 카드 동일성 판단 key
const cardKey = (c: CardItem) =>
  `${(c.corrected ?? "").trim()}||${(c.explanation ?? "").trim()}||${c.type}`;

const dedupeCardsPreserveOrder = (cards: CardItem[]) => {
  const seen = new Set<string>();
  const out: CardItem[] = [];
  for (const c of cards || []) {
    const k = cardKey(c);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
};

export default function ReviewScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();

  // ✅ history에서 다시 열었을 땐 auto-save 막기
  const fromHistory: boolean = route.params?.fromHistory ?? false;

  const incomingCards: CardItem[] = route.params?.reviewCards || [];
  const [reviewCards, setReviewCards] = useState<CardItem[]>(incomingCards);

  // ✅ 한 번만 저장되게
  const savedOnceRef = useRef(false);

  useEffect(() => {
    setReviewCards(incomingCards);
  }, [incomingCards]);

  // ✅ 화면 표시용: 중복 제거된 카드
  const visibleCards = useMemo(
    () => dedupeCardsPreserveOrder(reviewCards),
    [reviewCards]
  );

  // ✅ ReviewScreen이 뜨면 자동 누적 저장 (단, history에서 열면 저장 X)
  //    + 저장도 중복 제거해서 저장 (이미 같은 카드가 있으면 이번 저장에서 제외)
  useEffect(() => {
    if (fromHistory) return;
    if (savedOnceRef.current) return;
    if (!incomingCards || incomingCards.length === 0) return;

    savedOnceRef.current = true;

    const autoAppendSave = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const prev: SavedReviewSet[] = raw ? JSON.parse(raw) : [];
        const safePrev = Array.isArray(prev) ? prev : [];

        // ✅ 기존 전체 카드 key들
        const existingKeys = new Set<string>();
        for (const set of safePrev) {
          for (const c of set.cards || []) existingKeys.add(cardKey(c));
        }

        // ✅ 이번에 들어온 카드들 중 "기존에 없던 것만" 저장
        const uniqueIncoming = dedupeCardsPreserveOrder(incomingCards);
        const cardsToSave = uniqueIncoming.filter((c) => !existingKeys.has(cardKey(c)));

        if (cardsToSave.length === 0) return;

        const newSet: SavedReviewSet = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: Date.now(),
          cards: cardsToSave,
        };

        const next = [newSet, ...safePrev].slice(0, 100);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.log("Review auto save error", e);
      }
    };

    autoAppendSave();
  }, [incomingCards, fromHistory]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>복습하기</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* 카드 리스트 */}
        <ScrollView contentContainerStyle={styles.cardList}>
          {visibleCards.length > 0 ? (
            visibleCards.map((item, i) => (
              <View key={cardKey(item) + "-" + i} style={styles.card}>
                <View style={styles.cardBg} />
                <View style={styles.cardContentRow}>
                  <Text style={styles.cardTextEn}>{item.corrected}</Text>
                  <Text style={styles.cardTextKr}>{item.explanation}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>복습 데이터가 없습니다.</Text>
            </View>
          )}
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.btnText}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#E5E7ED" },
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#d5d8e0",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },

  cardList: { padding: 20, rowGap: 12, paddingBottom: 120 },
  card: { minHeight: 60, justifyContent: "center" },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(191,195,208,0.5)",
    borderRadius: 12,
  },
  cardContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  cardTextEn: { fontSize: 16, fontWeight: "600", flex: 1, marginRight: 10 },
  cardTextKr: { fontSize: 14, color: "#4B5563", maxWidth: "45%", textAlign: "right" },

  emptyContainer: { marginTop: 50, alignItems: "center" },
  emptyText: { color: "#6b7280", fontSize: 16 },

  bottomButtonsRow: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  btn: {
    backgroundColor: "#2C303C",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontSize: 14 },
});
