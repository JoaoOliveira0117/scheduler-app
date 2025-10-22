import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AvailableSchedule } from '@/services/scheduleService';

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ label, value, onChange }) => (
  <View style={styles.timeInputContainer}>
    <ThemedText style={styles.timeLabel}>{label}</ThemedText>
    <TextInput
      style={styles.timeInput}
      value={value}
      onChangeText={onChange}
      placeholder="HH:MM"
      keyboardType="numbers-and-punctuation"
      maxLength={5}
    />
  </View>
);

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

interface ScheduleSelectorProps {
  schedules: AvailableSchedule[];
  onSchedulesChange: (schedules: AvailableSchedule[]) => void;
  serviceId: number;
}

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  schedules,
  onSchedulesChange,
  serviceId,
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const addSchedule = () => {
    if (selectedDay === null || !startTime || !endTime) {
      return;
    }

    const newSchedule: AvailableSchedule = {
      service_id: serviceId,
      day_of_week: selectedDay,
      start_time: startTime,
      end_time: endTime,
      is_available: true,
    };

    onSchedulesChange([...schedules, newSchedule]);
    setStartTime('');
    setEndTime('');
  };

  const removeSchedule = (index: number) => {
    const newSchedules = [...schedules];
    newSchedules.splice(index, 1);
    onSchedulesChange(newSchedules);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Horários Disponíveis</ThemedText>

      <View style={styles.daysContainer}>
        {DAYS_OF_WEEK.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === index && styles.dayButtonSelected,
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDay === index && styles.dayTextSelected,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timeInputsRow}>
        <TimeInput
          label="Início"
          value={startTime}
          onChange={setStartTime}
        />
        <TimeInput
          label="Fim"
          value={endTime}
          onChange={setEndTime}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.addButton,
          (!selectedDay || !startTime || !endTime) && styles.addButtonDisabled,
        ]}
        onPress={addSchedule}
        disabled={!selectedDay || !startTime || !endTime}
      >
        <Text style={styles.addButtonText}>Adicionar Horário</Text>
      </TouchableOpacity>

      <View style={styles.schedulesList}>
        {schedules.map((schedule, index) => (
          <View key={index} style={styles.scheduleItem}>
            <Text style={styles.scheduleText}>
              {DAYS_OF_WEEK[schedule.day_of_week]}: {schedule.start_time} - {schedule.end_time}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeSchedule(index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dayButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
  },
  dayTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#374151',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  schedulesList: {
    gap: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
  },
  scheduleText: {
    fontSize: 14,
    color: '#374151',
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 16,
  },
});