// src/screens/ReviewHistoryScreen.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
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

export default function ReviewHistoryScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [allCards, setAllCards] = useState<CardItem[]>([]);
  const [rawSets, setRawSets] = useState<SavedReviewSet[]>([]);

  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const sets: SavedReviewSet[] = raw ? JSON.parse(raw) : [];

      const safeSets = Array.isArray(sets) ? sets : [];
      setRawSets(safeSets);

      // ✅ 오래된 → 최신 순으로 누적
      const flattenedCards = safeSets
        .slice()
        .reverse()
        .flatMap((set) => set.cards || []);

      // ✅ 화면은 중복 제거해서 1번만 보이게
      const unique = dedupeCardsPreserveOrder(flattenedCards);
      setAllCards(unique);
    } catch (e) {
      console.log("ReviewHistory load error", e);
      setAllCards([]);
      setRawSets([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  // ✅ index 삭제 대신: "해당 카드와 동일한 모든 카드" 삭제
  const deleteCardByItem = (item: CardItem) => {
    Alert.alert("삭제할까요?", "이 복습 카드를 삭제합니다. (중복된 동일 카드도 함께 삭제)", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            const sets: SavedReviewSet[] = raw ? JSON.parse(raw) : [];
            const safeSets = Array.isArray(sets) ? sets : [];

            const targetK = cardKey(item);

            const nextSets: SavedReviewSet[] = [];
            for (const set of safeSets) {
              const nextCards = (set.cards || []).filter((c) => cardKey(c) !== targetK);
              if (nextCards.length > 0) nextSets.push({ ...set, cards: nextCards });
            }

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSets));

            // ✅ 화면 갱신
            const flattened = nextSets
              .slice()
              .reverse()
              .flatMap((set) => set.cards || []);
            setAllCards(dedupeCardsPreserveOrder(flattened));
            setRawSets(nextSets);
          } catch (e) {
            console.log("선택 카드 삭제 실패", e);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 32 }}>
            <ChevronLeft size={24} color="#2c303c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>복습하기</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* 카드 누적 리스트 (중복 제거된 카드만 표시) */}
        <ScrollView contentContainerStyle={styles.cardList}>
          {allCards.length > 0 ? (
            allCards.map((item, i) => (
              <TouchableOpacity
                key={cardKey(item) + "-" + i}
                style={styles.card}
                activeOpacity={0.9}
                onLongPress={() => deleteCardByItem(item)}
              >
                <View style={styles.cardBg} />
                <View style={styles.cardContentRow}>
                  <Text style={styles.cardTextEn}>{item.corrected}</Text>
                  <Text style={styles.cardTextKr}>{item.explanation}</Text>
                </View>
              </TouchableOpacity>
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
    justifyContent: "space-between",
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
