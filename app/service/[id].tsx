import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { serviceService } from "@/services/serviceService";
import { scheduleService } from "@/services/scheduleService";
import { useAuth } from "@/contexts/AuthContext";

export default function AppointmentCreateScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const serviceId = Number(id);

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // =====================
  // Carrega serviço
  // =====================
  useEffect(() => {
    loadService();
  }, []);

  const loadService = async () => {
    setLoading(true);
    const s = await serviceService.getServiceById(serviceId);
    setService(s);
    setLoading(false);
  };

  // =====================
  // Carrega horários
  // =====================
  useEffect(() => {
    if (service) loadTimes();
  }, [selectedDate, service]);

  const loadTimes = async () => {
    const dateStr = selectedDate.toISOString().substring(0, 10);

    const times = await scheduleService.getAvailableTimesForDate(
      serviceId,
      dateStr
    );

    setAvailableTimes(times);
    setSelectedTime(null);
  };

  // =====================
  // Criar agendamento
  // =====================
  const handleCreate = async () => {
    if (!selectedTime) {
      Alert.alert("Atenção", "Selecione um horário.");
      return;
    }

    const dateStr = selectedDate.toISOString().substring(0, 10);

    try {
      await scheduleService.createAppointment({
        client_id: user!.id,
        service_id: serviceId,
        scheduled_date: dateStr,
        scheduled_time: selectedTime,
        status: "agendado",
        notes: null,
      });

      router.push({
        pathname: "/appointments/confirmation",
        params: {
          serviceTitle: service.title,
          providerName: service.provider_name,
          date: dateStr,
          time: selectedTime,
        },
      });
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    }
  };

  // =====================
  // Renderização
  // =====================
  if (loading || !service) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#245eff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Detalhes do Serviço */}
      <Text style={styles.title}>{service.title}</Text>
      <Text style={styles.infoLabel}>Descrição</Text>
      <Text style={styles.infoText}>{service.description}</Text>

      <Text style={styles.infoLabel}>Cidade</Text>
      <Text style={styles.infoText}>{service.city}</Text>

      <Text style={styles.infoLabel}>Preço</Text>
      <Text style={styles.infoText}>R$ {service.price}</Text>

      <Text style={styles.infoLabel}>Duração</Text>
      <Text style={styles.infoText}>{service.duration} minutos</Text>

      <View style={{ height: 20 }} />

      {/* Seleção de Data */}
      <Text style={styles.section}>Selecione a Data:</Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          {selectedDate.toLocaleDateString("pt-BR")}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Horários */}
      <Text style={styles.section}>Horários disponíveis:</Text>

      {availableTimes.length === 0 && (
        <Text style={styles.empty}>Nenhum horário disponível.</Text>
      )}

      {availableTimes.map((t) => (
        <TouchableOpacity
          key={t}
          style={[
            styles.timeButton,
            selectedTime === t && styles.selectedTimeButton,
          ]}
          onPress={() => setSelectedTime(t)}
        >
          <Text
            style={[
              styles.timeText,
              selectedTime === t && styles.selectedTimeText,
            ]}
          >
            {t}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.confirmButton} onPress={handleCreate}>
        <Text style={styles.confirmText}>Confirmar Agendamento</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  infoLabel: { fontSize: 14, marginTop: 10, fontWeight: "bold" },
  infoText: { fontSize: 15, color: "#444" },

  section: { fontSize: 18, marginTop: 25, marginBottom: 10 },

  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  dateButtonText: { fontSize: 16 },

  empty: { fontSize: 14, color: "#777" },

  timeButton: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedTimeButton: {
    backgroundColor: "#245eff",
  },
  timeText: { fontSize: 16 },
  selectedTimeText: { color: "white", fontWeight: "600" },

  confirmButton: {
    backgroundColor: "#245eff",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  confirmText: { color: "white", fontSize: 16, fontWeight: "600" },
});
