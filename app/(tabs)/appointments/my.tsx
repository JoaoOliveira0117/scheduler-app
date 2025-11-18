import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { scheduleService } from "@/services/scheduleService";
import { useAuth } from "@/contexts/AuthContext";

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await scheduleService.getAppointmentsByClient(user!.id);
    setAppointments(data);
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
        <Text style={styles.empty}>Você ainda não agendou nenhum serviço.</Text>
      )}

      {appointments.map((a) => (
        <View key={a.id} style={styles.card}>
          <Text style={styles.service}>{a.service_title}</Text>
          <Text style={styles.info}>Prestador: {a.provider_name}</Text>
          <Text style={styles.info}>Data: {a.scheduled_date}</Text>
          <Text style={styles.info}>Horário: {a.scheduled_time}</Text>
          <Text style={styles.status}>Status: {a.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  empty: { marginTop: 20, color: "#777" },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  service: { fontSize: 18, fontWeight: "bold" },
  info: { marginTop: 5, fontSize: 14 },
  status: { marginTop: 8, fontWeight: "600" },
});
