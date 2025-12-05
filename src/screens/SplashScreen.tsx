// src/screens/SplashScreen.tsx

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import PandaIcon from '../components/PandaIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  navigation: any;
};

export default function SplashScreen({ navigation }: Props) {

  useEffect(() => {
    const bootstrap = async () => {
      // Show splash animation a bit
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1200);
      });
      

      // Check if user is logged in (token exist?)
      const token = await AsyncStorage.getItem("accessToken");

      if (token) {
        // User logged in → go Home
        navigation.replace("Home");
      } else {
        // Not logged in → go Login
        navigation.replace("Login");
      }
    };

    bootstrap();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.centerBlock}>
          <PandaIcon size="large" />

          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotMedium]} />
            <View style={[styles.dot, styles.dotLight]} />
          </View>
        </View>

        <View style={styles.bottomBlock}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>LING</Text>
            <PandaIcon size="small" />
            <Text style={styles.logoText}>MATE</Text>
          </View>
          <Text style={styles.subtitle}>English • 한국어</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f5f8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 24,
    columnGap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: '#2c303c',
  },
  dotMedium: {
    backgroundColor: '#9ca3af',
  },
  dotLight: {
    backgroundColor: '#d1d5db',
  },
  bottomBlock: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    marginBottom: 6,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#4b5563',
  },
});
