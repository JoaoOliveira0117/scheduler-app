import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar Serviços',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="search" color={color} />
          ),
        }}
      />

      {/* 🔵 NOVA ABA */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Agendamentos',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="calendar" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="payments"
        options={{
          title: 'Pagamentos',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="creditcard" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reviews"
        options={{
          title: 'Avaliações',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="star" color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
