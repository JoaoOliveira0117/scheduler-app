import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Service, ServiceCategory, serviceService } from '@/services/serviceService';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SearchScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category_id: undefined as number | undefined,
    city: '',
    min_price: undefined as number | undefined,
    max_price: undefined as number | undefined,
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [servicesData, categoriesData] = await Promise.all([
        serviceService.getAllServices(),
        serviceService.getAllCategories(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Erro ao carregar dados');
    }
  };

  const handleSearch = async () => {
    try {
      const searchFilters = {
        search: searchTerm.trim() || undefined,
        ...filters,
      };
      const results = await serviceService.searchServices(searchFilters);
      setServices(results);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      Alert.alert('Erro', 'Erro ao buscar serviços');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category_id: undefined,
      city: '',
      min_price: undefined,
      max_price: undefined,
    });
    loadInitialData();
  };

  const renderServiceCard = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{item.category_name || 'Outros'}</Text>
        </View>
      </View>
      
      <Text style={styles.serviceTitle}>{item.title}</Text>
      <Text style={styles.serviceDescription}>{item.description}</Text>
      
      <View style={styles.serviceInfo}>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) || '0.0'}</Text>
        </View>
        
        <View style={styles.locationContainer}>
          <Text style={styles.location}>📍 {item.city}</Text>
        </View>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
        <Text style={styles.priceType}>
          {item.price_type === 'fixo' ? 'valor fixo' : 
           item.price_type === 'por_hora' ? 'por hora' : 'orçamento'}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>Ver Detalhes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Encontre o Serviço Ideal
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Milhares de prestadores qualificados esperando por você
        </ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="O que você está procurando?"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersCard}>
            <Text style={styles.filtersTitle}>Filtros</Text>
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Categoria</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowCategoryDropdown(prev => !prev)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownText}>
                  {filters.category_id 
                    ? categories.find(c => c.id === filters.category_id)?.name 
                    : 'Todas as Categorias'}
                </Text>
              </TouchableOpacity>
              
              {showCategoryDropdown && (
                <View style={styles.categoryList}>
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      setFilters(prev => ({ ...prev, category_id: undefined }));
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={styles.categoryItemText}>Todas as Categorias</Text>
                  </TouchableOpacity>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.categoryItem,
                        filters.category_id === c.id && styles.categorySelected,
                      ]}
                      onPress={() => {
                        setFilters(prev => ({ ...prev, category_id: c.id }));
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.categoryItemText}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Cidade</Text>
              <TextInput
                style={styles.cityInput}
                placeholder="Digite a cidade"
                value={filters.city}
                onChangeText={(value) => setFilters(prev => ({ ...prev, city: value }))}
              />
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>$ Faixa de Preço</Text>
              <View style={styles.priceInputs}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Preço mínimo"
                  value={filters.min_price?.toString() || ''}
                  onChangeText={(value) => setFilters(prev => ({ 
                    ...prev, 
                    min_price: value ? parseFloat(value) : undefined 
                  }))}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.priceInput}
                  placeholder="Preço máximo"
                  value={filters.max_price?.toString() || ''}
                  onChangeText={(value) => setFilters(prev => ({ 
                    ...prev, 
                    max_price: value ? parseFloat(value) : undefined 
                  }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>
          {services.length} serviços encontrados
        </Text>
        
        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id?.toString() || ''}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.servicesList}
          onScrollBeginDrag={() => setShowFilters(false)}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#245effff',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  searchContainer: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterButton: {
    backgroundColor: '#245effff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  filterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  dropdown: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  categoryList: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
    paddingVertical: 4,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryItemText: {
    fontSize: 16,
    color: '#374151',
  },
  categorySelected: {
    backgroundColor: '#eef2ff',
  },
  cityInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#245effff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  servicesList: {
    paddingBottom: 20,
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
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceType: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewDetailsButton: {
    backgroundColor: '#245effff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
