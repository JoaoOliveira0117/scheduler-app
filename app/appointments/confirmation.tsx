// app/appointments/confirmation.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function AppointmentConfirmation() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // params: serviceTitle, date, time, providerName
  const serviceTitle = (params.serviceTitle as string) || "";
  const date = (params.date as string) || "";
  const time = (params.time as string) || "";
  const providerName = (params.providerName as string) || "";

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="title" style={styles.title}>Agendamento Confirmado</ThemedText>

        <Text style={styles.label}>Serviço</Text>
        <Text style={styles.value}>{serviceTitle}</Text>

        <Text style={styles.label}>Prestador</Text>
        <Text style={styles.value}>{providerName}</Text>

        <Text style={styles.label}>Data</Text>
        <Text style={styles.value}>{date}</Text>

        <Text style={styles.label}>Horário</Text>
        <Text style={styles.value}>{time}</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)/search')}>
          <Text style={styles.buttonText}>Voltar para Buscar</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  card: { width: "90%", backgroundColor: "white", padding: 20, borderRadius: 12, elevation: 3 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  label: { fontSize: 12, color: "#6b7280", marginTop: 10 },
  value: { fontSize: 16, fontWeight: "600", color: "#111827" },
  button: { marginTop: 20, backgroundColor: "#245eff", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700" },
});
