import { useAuth } from "@/contexts/AuthContext";
import { scheduleService } from "@/services/scheduleService";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    setLoading(true);

    if (!user) {
      // usuário não logado — nada a carregar
      setAppointments([]);
      setLoading(false);
      return;
    }

    let result: any[] = [];

    if (user.user_type === "cliente") {
      result = await scheduleService.getAppointmentsByClient(user.id!);
    } else {
      result = await scheduleService.getAppointmentsByProvider(user.id!);
    }

    setAppointments(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#245eff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Meus Agendamentos</Text>

      {appointments.length === 0 && (
        <Text style={styles.empty}>Nenhum agendamento encontrado.</Text>
      )}

      {appointments.map((a) => (
        <View key={a.id} style={styles.card}>
          <Text style={styles.service}>{a.service_title}</Text>
          <Text style={styles.date}>{a.scheduled_date} às {a.scheduled_time}</Text>
          <Text style={styles.user}>
            {user?.user_type === "cliente" ? `Prestador: ${a.provider_name}` : `Cliente: ${a.client_name}`}
          </Text>
          <Text style={styles.status}>Status: {a.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  empty: { fontSize: 16, color: "#666" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
  },
  service: { fontSize: 18, fontWeight: "600" },
  date: { marginTop: 5, fontSize: 16 },
  user: { marginTop: 5, fontSize: 15, color: "#333" },
  status: { marginTop: 5, fontSize: 14, fontWeight: "500", color: "#245eff" },
});
