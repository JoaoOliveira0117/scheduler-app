import LoadingScreen from '@/components/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isInitialized } = useAuth();

  React.useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, isInitialized]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
      router.replace('/auth');
  }

  return <>{children}</>;
}
