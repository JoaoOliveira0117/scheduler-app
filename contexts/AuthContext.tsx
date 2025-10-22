import { databaseService } from '@/services/database';
import { User, userService } from '@/services/userService';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await databaseService.initialize();
      console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const loggedUser = await userService.login({ email, password });
      
      if (loggedUser) {
        setUser(loggedUser);
        // Redirecionar para a tela inicial após login bem-sucedido
        router.replace('/(tabs)');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      const newUser = await userService.createUser(userData);
      setUser(newUser);
      // Redirecionar para a tela inicial após cadastro bem-sucedido
      router.replace('/(tabs)');
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // Redirecionar para a tela de autenticação após logout
    router.replace('/auth');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
