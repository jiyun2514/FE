// src/screens/LogoutModal.tsx

import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AuthContext } from '../../App';

type Props = {
  navigation: any;
};

export default function LogoutModal({ navigation }: Props) {
  const { logout } = useContext(AuthContext);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleConfirmLogout = async () => {
    await logout();   // clears accessToken + userId in App.tsx
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        <Text style={styles.title}>로그아웃</Text>
        <Text style={styles.message}>
          로그아웃 하시겠습니까?
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.buttonLeft}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>취소</Text>
          </Pressable>

          <Pressable
            style={styles.buttonRight}
            onPress={handleConfirmLogout}
          >
            <Text style={styles.buttonText}>로그아웃</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  buttonLeft: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  buttonRight: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c303c',
  },
});
