import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function LoadingScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#245effff" />
        <ThemedText style={styles.text}>Carregando...</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});
