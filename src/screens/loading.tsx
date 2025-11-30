import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
  
      <ActivityIndicator size="large" color="#2c303c" />
    </View>)
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 전체 화면 채우기
    justifyContent: 'center', // 세로 중앙 정렬
    alignItems: 'center', // 가로 중앙 정렬
    backgroundColor: '#e8eaf0', // ChatScreen과 동일한 배경색 유지
  },
});
