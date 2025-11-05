import { ScheduleSelector } from '@/components/schedule-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { AvailableSchedule, scheduleService } from '@/services/scheduleService';
import { Service, serviceService } from '@/services/serviceService';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    price_type: 'fixo' as 'fixo' | 'por_hora' | 'orcamento',
    city: '',
    durationMinutes: '',
    category_id: undefined as number | undefined,
    schedules: [] as AvailableSchedule[],
  });

  const loadData = useCallback(async () => {
    if (!user || user.user_type !== 'prestador') return;

    try {
      setLoading(true);
      const servicesData = await serviceService.getServicesByProvider(user.id!);
      
      // Carregar horários para cada serviço
      const servicesWithSchedules = await Promise.all(
        servicesData.map(async (service) => {
          const schedules = await scheduleService.getAvailableSchedulesByService(service.id!);
          return { ...service, schedules };
        })
      );
      
      setServices(servicesWithSchedules);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInputChange = (field: string, value: string | number | AvailableSchedule[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Erro', 'Preço deve ser maior que 0');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Erro', 'Cidade é obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    try {
      setLoading(true);
      const serviceData = {
        provider_id: user.id!,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        price_type: formData.price_type,
        city: formData.city.trim(),
        category_id: formData.category_id || undefined,
        duration: parseInt(formData.durationMinutes) || 0,
      };

      let savedService: Service;
      if (editingService) {
        savedService = await serviceService.updateService(editingService.id!, serviceData);
      } else {
        savedService = await serviceService.createService(serviceData);
      }

      // Atualizar horários
      if (formData.schedules.length > 0) {
        // Excluir horários existentes
        if (editingService) {
          const existingSchedules = await scheduleService.getAvailableSchedulesByService(editingService.id!);
          await Promise.all(existingSchedules.map(schedule => 
            scheduleService.deleteAvailableSchedule(schedule.id!)
          ));
        }

        // Criar novos horários
        await Promise.all(formData.schedules.map(schedule => 
          scheduleService.createAvailableSchedule({
            ...schedule,
            service_id: savedService.id!,
          })
        ));
      }

      Alert.alert('Sucesso', `Serviço ${editingService ? 'atualizado' : 'criado'} com sucesso!`);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar serviço:', error);
      Alert.alert('Erro', error.message || 'Erro ao salvar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (service: Service) => {
    try {
      const schedules = await scheduleService.getAvailableSchedulesByService(service.id!);
      setEditingService(service);
      setFormData({
        title: service.title,
        description: service.description,
        price: service.price.toString(),
        price_type: service.price_type,
        city: service.city,
        category_id: service.category_id || undefined,
        schedules: schedules || [],
        durationMinutes: service.durationMinutes?.toString() || '',
      });
      setShowAddForm(true);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      Alert.alert('Erro', 'Erro ao carregar horários do serviço');
    }
  };

  const handleDelete = (serviceId: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await serviceService.deleteService(serviceId);
              Alert.alert('Sucesso', 'Serviço excluído com sucesso!');
              loadData();
            } catch (error) {
              console.error('Erro ao excluir serviço:', error);
              Alert.alert('Erro', 'Erro ao excluir serviço');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      price_type: 'fixo',
      city: '',
      category_id: undefined,
      schedules: [],
    });
    setEditingService(null);
    setShowAddForm(false);
  };

  const renderServiceCard = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceTitle}>{item.title}</Text>
        <View style={styles.serviceActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id!)}
          >
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.serviceDescription}>{item.description}</Text>
      <Text style={styles.servicePrice}>
        R$ {item.price.toFixed(2)} - {item.price_type === 'fixo' ? 'valor fixo' : 
        item.price_type === 'por_hora' ? 'por hora' : 'orçamento'}
      </Text>
      <Text style={styles.serviceLocation}>📍 {item.city}</Text>
      {item.schedules && item.schedules.length > 0 && (
        <View style={styles.serviceSchedules}>
          <Text style={styles.serviceSchedulesTitle}>Horários Disponíveis:</Text>
          {item.schedules.map((schedule: AvailableSchedule, index: number) => (
            <Text key={index} style={styles.serviceScheduleItem}>
              {DAYS_OF_WEEK[schedule.day_of_week]}: {schedule.start_time} - {schedule.end_time}
            </Text>
          ))}
        </View>
      )}
      {item.category_name && (
        <Text style={styles.serviceCategory}>Categoria: {item.category_name}</Text>
      )}
    </View>
  );

  if (user?.user_type !== 'prestador') {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Perfil</ThemedText>
        </View>
        <View style={styles.content}>
          <ThemedText style={styles.message}>
            Esta área é apenas para prestadores de serviço.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Meus Serviços</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ Adicionar Serviço</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {showAddForm && (
          <View style={styles.formCard}>
            <ThemedText style={styles.formTitle}>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </ThemedText>

            <TextInput
            style={styles.input}
            placeholder="Título do serviço"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrição do serviço"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={3}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Preço"
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              keyboardType="numeric"
            />

            <View style={[styles.input, styles.halfInput, styles.dropdown]}>
              <Text style={styles.dropdownText}>
                {formData.price_type === 'fixo' ? 'Valor Fixo' :
                 formData.price_type === 'por_hora' ? 'Por Hora' : 'Orçamento'}
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Duração do serviço (em minutos)"
            value={formData.durationMinutes}
            onChangeText={(value) => handleInputChange('durationMinutes', value)}
            keyboardType="numeric"
          />

          <ScheduleSelector
            schedules={formData.schedules}
            onSchedulesChange={(schedules) => handleInputChange('schedules', schedules)}
            serviceId={editingService?.id || -1}
          />

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetForm}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Salvando...' : editingService ? 'Atualizar' : 'Criar'}
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        )}

        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id?.toString() || ''}
          contentContainerStyle={styles.servicesList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#245effff',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#245effff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
  },
  formCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#374151',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  dropdown: {
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#245effff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  servicesList: {
    padding: 20,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#245effff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 12,
    color: '#9ca3af',
  },
  serviceSchedules: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  serviceSchedulesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  serviceScheduleItem: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
});
