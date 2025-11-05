import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { serviceService } from '@/services/serviceService';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { scheduleUtils } from '@/services/serviceService';

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await serviceService.getServiceById(Number(id));
        setService(data);
      } catch (error) {
        console.error('Erro ao carregar serviço:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#245eff" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.center}>
        <Text>Serviço não encontrado</Text>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>{service.title}</ThemedText>
        <Text style={styles.category}>{service.category_name}</Text>
        <Text style={styles.description}>{service.description}</Text>
        <Text style={styles.price}>💰 R$ {service.price.toFixed(2)}</Text>
        <Text style={styles.city}>📍 {service.city}</Text>
        <Text style={styles.provider}>👤 {service.provider_name}</Text>
        <Text style={styles.rating}>⭐ {service.rating?.toFixed(1) || '0.0'}</Text>

        <View style={styles.scheduleBox}>
          <Text style={styles.scheduleTitle}>Agenda disponível</Text>

          {service.schedules && service.schedules.length > 0 ? (
            service.schedules.map((schedule: any, index: number) => {
              const availableTimes = scheduleUtils.generateAvailableTimes(
                schedule.start_time,
                schedule.end_time,
                service.duration // ← divide conforme a duração
              );

              return (
                <View key={index} style={{ marginBottom: 12 }}>
                  <Text style={styles.scheduleText}>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][schedule.day_of_week]}:{' '}
                    {schedule.start_time} - {schedule.end_time}
                  </Text>

                  {availableTimes.length > 0 ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                      {availableTimes.map((time, i) => (
                        <View key={i} style={styles.timeSlot}>
                          <Text style={styles.timeText}>{time}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.scheduleText}>Nenhum horário disponível.</Text>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.scheduleText}>Nenhum horário cadastrado.</Text>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scroll: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  category: { fontSize: 16, color: '#6b7280', marginBottom: 8 },
  description: { fontSize: 16, color: '#374151', marginBottom: 16 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  city: { fontSize: 16, color: '#6b7280', marginBottom: 8 },
  provider: { fontSize: 16, color: '#245eff', marginBottom: 8 },
  rating: { fontSize: 16, color: '#f59e0b', marginBottom: 16 },
  scheduleBox: { marginTop: 20, backgroundColor: '#fff', padding: 16, borderRadius: 10 },
  scheduleTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  scheduleText: { color: '#6b7280', fontSize: 14 },
  timeSlot: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    margin: 4,
  },
  timeText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
  },
});
