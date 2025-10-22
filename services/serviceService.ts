import { databaseService } from './database';

export interface ServiceCategory {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Service {
  id?: number;
  provider_id: number;
  category_id?: number;
  title: string;
  description: string;
  price: number;
  price_type: 'fixo' | 'por_hora' | 'orcamento';
  city: string;
  rating?: number;
  rating_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Campos relacionados
  provider_name?: string;
  category_name?: string;
}

export interface ServiceSearchFilters {
  search?: string;
  category_id?: number;
  city?: string;
  min_price?: number;
  max_price?: number;
  price_type?: string;
  min_rating?: number;
}

export class ServiceService {
  private async ensureDatabaseInitialized() {
    await databaseService.initialize();
  }

  private getDb() {
    return databaseService.getDatabase();
  }

  // Validações
  private validatePrice(price: number): boolean {
    return price > 0 && price <= 999999.99;
  }

  private validatePriceType(priceType: string): boolean {
    return ['fixo', 'por_hora', 'orcamento'].includes(priceType);
  }

  async createService(serviceData: Omit<Service, 'id' | 'rating' | 'rating_count' | 'is_active' | 'created_at' | 'updated_at'>): Promise<Service> {
    await this.ensureDatabaseInitialized();
    
    // Validações
    if (!serviceData.title.trim()) {
      throw new Error('Título é obrigatório');
    }

    if (!serviceData.description.trim()) {
      throw new Error('Descrição é obrigatória');
    }

    if (!this.validatePrice(serviceData.price)) {
      throw new Error('Preço deve ser maior que 0 e menor que 999999.99');
    }

    if (!this.validatePriceType(serviceData.price_type)) {
      throw new Error('Tipo de preço deve ser "fixo", "por_hora" ou "orcamento"');
    }

    if (!serviceData.city.trim()) {
      throw new Error('Cidade é obrigatória');
    }

    // Verificar se o prestador existe
    const provider = await this.getDb().getFirstAsync(
      `SELECT id FROM users WHERE id = ? AND user_type = 'prestador'`,
      [serviceData.provider_id]
    );

    if (!provider) {
      throw new Error('Prestador não encontrado');
    }

    // Verificar se a categoria existe (se fornecida)
    if (serviceData.category_id) {
      const category = await this.getDb().getFirstAsync(
        `SELECT id FROM service_categories WHERE id = ?`,
        [serviceData.category_id]
      );

      if (!category) {
        throw new Error('Categoria não encontrada');
      }
    }

    try {
      const result = await this.getDb().runAsync(
        `INSERT INTO services (provider_id, category_id, title, description, price, price_type, city) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          serviceData.provider_id,
          serviceData.category_id || null,
          serviceData.title.trim(),
          serviceData.description.trim(),
          serviceData.price,
          serviceData.price_type,
          serviceData.city.trim()
        ]
      );

      const newService = await this.getServiceById(result.lastInsertRowId as number);
      return newService!;
    } catch (error: any) {
      throw new Error('Erro ao criar serviço: ' + error.message);
    }
  }

  async getServiceById(id: number): Promise<Service | null> {
    await this.ensureDatabaseInitialized();
    
    const service = await this.getDb().getFirstAsync<Service>(
      `SELECT s.*, u.name as provider_name, sc.name as category_name
       FROM services s
       LEFT JOIN users u ON s.provider_id = u.id
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.id = ?`,
      [id]
    );

    return service || null;
  }

  async updateService(id: number, serviceData: Partial<Omit<Service, 'id' | 'provider_id' | 'rating' | 'rating_count' | 'created_at' | 'updated_at'>>): Promise<Service> {
    await this.ensureDatabaseInitialized();
    const updates: string[] = [];
    const values: any[] = [];

    if (serviceData.title !== undefined) {
      if (!serviceData.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      updates.push('title = ?');
      values.push(serviceData.title.trim());
    }

    if (serviceData.description !== undefined) {
      if (!serviceData.description.trim()) {
        throw new Error('Descrição é obrigatória');
      }
      updates.push('description = ?');
      values.push(serviceData.description.trim());
    }

    if (serviceData.price !== undefined) {
      if (!this.validatePrice(serviceData.price)) {
        throw new Error('Preço deve ser maior que 0 e menor que 999999.99');
      }
      updates.push('price = ?');
      values.push(serviceData.price);
    }

    if (serviceData.price_type !== undefined) {
      if (!this.validatePriceType(serviceData.price_type)) {
        throw new Error('Tipo de preço deve ser "fixo", "por_hora" ou "orcamento"');
      }
      updates.push('price_type = ?');
      values.push(serviceData.price_type);
    }

    if (serviceData.city !== undefined) {
      if (!serviceData.city.trim()) {
        throw new Error('Cidade é obrigatória');
      }
      updates.push('city = ?');
      values.push(serviceData.city.trim());
    }

    if (serviceData.category_id !== undefined) {
      if (serviceData.category_id) {
        const category = await this.getDb().getFirstAsync(
          `SELECT id FROM service_categories WHERE id = ?`,
          [serviceData.category_id]
        );

        if (!category) {
          throw new Error('Categoria não encontrada');
        }
      }
      updates.push('category_id = ?');
      values.push(serviceData.category_id || null);
    }

    if (serviceData.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(serviceData.is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    try {
      await this.getDb().runAsync(
        `UPDATE services SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const updatedService = await this.getServiceById(id);
      return updatedService!;
    } catch (error: any) {
      throw new Error('Erro ao atualizar serviço: ' + error.message);
    }
  }

  async deleteService(id: number): Promise<void> {
    await this.ensureDatabaseInitialized();
    await this.getDb().runAsync(`DELETE FROM services WHERE id = ?`, [id]);
  }

  async getAllServices(): Promise<Service[]> {
    await this.ensureDatabaseInitialized();
    
    const services = await this.getDb().getAllAsync<Service>(
      `SELECT s.*, u.name as provider_name, sc.name as category_name
       FROM services s
       LEFT JOIN users u ON s.provider_id = u.id
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.is_active = 1
       ORDER BY s.created_at DESC`
    );
    return services;
  }

  async searchServices(filters: ServiceSearchFilters): Promise<Service[]> {
    await this.ensureDatabaseInitialized();
    
    let query = `
      SELECT s.*, u.name as provider_name, sc.name as category_name
      FROM services s
      LEFT JOIN users u ON s.provider_id = u.id
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = 1
    `;

    const values: any[] = [];

    if (filters.search) {
      query += ` AND (s.title LIKE ? OR s.description LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
    }

    if (filters.category_id) {
      query += ` AND s.category_id = ?`;
      values.push(filters.category_id);
    }

    if (filters.city) {
      query += ` AND s.city LIKE ?`;
      values.push(`%${filters.city}%`);
    }

    if (filters.min_price !== undefined) {
      query += ` AND s.price >= ?`;
      values.push(filters.min_price);
    }

    if (filters.max_price !== undefined) {
      query += ` AND s.price <= ?`;
      values.push(filters.max_price);
    }

    if (filters.price_type) {
      query += ` AND s.price_type = ?`;
      values.push(filters.price_type);
    }

    if (filters.min_rating !== undefined) {
      query += ` AND s.rating >= ?`;
      values.push(filters.min_rating);
    }

    query += ` ORDER BY s.rating DESC, s.created_at DESC`;

    const services = await this.getDb().getAllAsync<Service>(query, values);
    return services;
  }

  async getServicesByProvider(providerId: number): Promise<Service[]> {
    await this.ensureDatabaseInitialized();
    
    const services = await this.getDb().getAllAsync<Service>(
      `SELECT s.*, u.name as provider_name, sc.name as category_name
       FROM services s
       LEFT JOIN users u ON s.provider_id = u.id
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.provider_id = ?
       ORDER BY s.created_at DESC`,
      [providerId]
    );
    return services;
  }

  // Métodos para categorias
  async getAllCategories(): Promise<ServiceCategory[]> {
    await this.ensureDatabaseInitialized();
    
    const categories = await this.getDb().getAllAsync<ServiceCategory>(
      `SELECT * FROM service_categories ORDER BY name`
    );
    return categories;
  }

  async createCategory(categoryData: Omit<ServiceCategory, 'id' | 'created_at'>): Promise<ServiceCategory> {
    await this.ensureDatabaseInitialized();
    
    if (!categoryData.name.trim()) {
      throw new Error('Nome da categoria é obrigatório');
    }

    try {
      const result = await this.getDb().runAsync(
        `INSERT INTO service_categories (name, description) VALUES (?, ?)`,
        [categoryData.name.trim(), categoryData.description || null]
      );

      const newCategory = await this.getDb().getFirstAsync<ServiceCategory>(
        `SELECT * FROM service_categories WHERE id = ?`,
        [result.lastInsertRowId as number]
      );

      return newCategory!;
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Categoria já existe');
      }
      throw new Error('Erro ao criar categoria: ' + error.message);
    }
  }
}

export const serviceService = new ServiceService();
