import LoadingScreen from '@/components/LoadingScreen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { user, isAuthenticated, isInitialized, logout } = useAuth();

  React.useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isInitialized, isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: logout },
      ]
    );
  };

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Agendei
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Plataforma de Serviços
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText type="subtitle" style={styles.welcome}>
          Bem-vindo, {user?.name}!
        </ThemedText>
        
        <ThemedText style={styles.description}>
          Você está logado como: {user?.user_type === 'cliente' ? 'Cliente' : 'Prestador'}
        </ThemedText>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Text style={styles.buttonText}>Buscar Serviços</Text>
          </TouchableOpacity>

          {user?.user_type === 'prestador' && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.buttonText}>Gerenciar Serviços</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#245effff',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#245effff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});