import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View style={styles.container}>
      {isLogin ? (
        <LoginScreen onNavigateToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterScreen onNavigateToLogin={() => setIsLogin(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
});
