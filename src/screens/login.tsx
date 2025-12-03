// src/screens/login.tsx (or LoginScreen.tsx)

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PandaIcon from '../components/PandaIcon';
import { AuthContext } from '../../App';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth0Login = async () => {
    try {
      await login();                 // 🔐 calls authorize(...) in App.tsx
      navigation.reset({             // go to Home and clear back stack
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (e) {
      console.error('Login failed:', e);
    }
  };

  const goSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>LING</Text>
            <PandaIcon size="small" />
            <Text style={styles.logoText}>MATE</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Welcome back 👋</Text>
          <Text style={styles.subtitle}>
            Sign in to continue practicing English.
          </Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Login button */}
          <Pressable style={styles.loginButton} onPress={handleAuth0Login}>
            <Text style={styles.loginButtonText}>로그인 (Auth0)</Text>
          </Pressable>

          {/* Signup */}
          <Pressable onPress={goSignup} style={styles.signupButton}>
            <Text style={styles.signupButtonText}>회원가입 하기</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8eaf0',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c303c',
    letterSpacing: 1,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    color: '#111827',
  },
  loginButton: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  signupButton: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d424f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: '#3d424f',
    fontWeight: '500',
    fontSize: 15,
  },
});
