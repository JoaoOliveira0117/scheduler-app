import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    cpf: '',
    userType: 'cliente' as 'cliente' | 'prestador',
  });
  const { register, isLoading } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (!formData.cpf.trim() || formData.cpf.length !== 11) {
      Alert.alert('Erro', 'CPF é obrigatório e deve ter 11 dígitos');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const success = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim() || undefined,
      city: formData.city.trim() || undefined,
      cpf: formData.cpf.trim(),
      user_type: formData.userType,
    });

    if (success) {
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
    } else {
      Alert.alert('Erro', 'Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.formContainer}>
          <ThemedText type="title" style={styles.title}>
            Criar Conta
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Preencha os dados para se cadastrar
          </ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Nome Completo *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Digite seu nome completo"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Senha *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Digite sua senha"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Confirmar Senha *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirme sua senha"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Telefone</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Cidade</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholder="Digite sua cidade"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>CPF *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.cpf}
              onChangeText={(value) => handleInputChange('cpf', value)}
              placeholder="Digite seu CPF"
              keyboardType="numeric"
              maxLength={11}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Tipo de Usuário *</ThemedText>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleInputChange('userType', formData.userType === 'prestador' ? 'cliente' : 'prestador')}
            >
              <View style={[styles.checkbox, formData.userType === 'prestador' && styles.checkboxSelected]}>
                {formData.userType === 'prestador' && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <ThemedText style={styles.checkboxLabel}>Sou prestador de serviços</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={onNavigateToLogin}
          >
            <ThemedText style={styles.linkText}>
              Já tem uma conta? Faça login
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#245effff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6b7280',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  radioButtonSelected: {
    borderColor: '#245effff',
    backgroundColor: '#eef2ff',
  },
  radioText: {
    fontSize: 16,
    color: '#6b7280',
  },
  radioTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#245effff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
