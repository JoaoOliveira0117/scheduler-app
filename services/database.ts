import * as SQLite from 'expo-sqlite';

export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('servplat.db');
      await this.createTables();
      await this.runMigrations();
      await this.seedData();
      this.isInitialized = true;
      console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      this.initPromise = null;
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Banco de dados não inicializado');

    const migrations = [
      // Adicionar coluna CPF
      `ALTER TABLE users ADD COLUMN cpf TEXT NOT NULL DEFAULT '00000000000';
       CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);`
    ];

    for (const migration of migrations) {
      try {
        await this.db.execAsync(migration);
      } catch (error) {
        console.log('Migração já aplicada ou erro:', error);
      }
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Banco de dados não inicializado');

    const schema = `
      -- Tabela de usuários
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          cpf TEXT UNIQUE NOT NULL DEFAULT '00000000000',
          phone TEXT,
          city TEXT,
          user_type TEXT NOT NULL CHECK (user_type IN ('cliente', 'prestador')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de categorias de serviços
      CREATE TABLE IF NOT EXISTS service_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de serviços
      CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          provider_id INTEGER NOT NULL,
          category_id INTEGER,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          price_type TEXT NOT NULL CHECK (price_type IN ('fixo', 'por_hora', 'orcamento')),
          city TEXT NOT NULL,
          duration INTEGER default 60,
          rating DECIMAL(3,2) DEFAULT 0.0,
          rating_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES service_categories(id)
      );

      -- Tabela de horários disponíveis
      CREATE TABLE IF NOT EXISTS available_schedules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          service_id INTEGER NOT NULL,
          day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          is_available BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      );

      -- Tabela de agendamentos
      CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER NOT NULL,
          service_id INTEGER NOT NULL,
          scheduled_date DATE NOT NULL,
          scheduled_time TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'concluido')),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      );

      -- Tabela de avaliações
      CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          appointment_id INTEGER NOT NULL,
          client_id INTEGER NOT NULL,
          service_id INTEGER NOT NULL,
          rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
          FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      );

      -- Índices
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
      CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
      CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
      CREATE INDEX IF NOT EXISTS idx_services_city ON services(city);
      CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
      CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_date);
      CREATE INDEX IF NOT EXISTS idx_schedules_service ON available_schedules(service_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_day ON available_schedules(day_of_week);
    `;

    await this.db.execAsync(schema);
  }

  private async seedData(): Promise<void> {
    if (!this.db) throw new Error('Banco de dados não inicializado');

    const seedData = `
      -- Inserir categorias de serviços
      INSERT OR IGNORE INTO service_categories (name, description) VALUES
      ('Limpeza', 'Serviços de limpeza residencial e comercial'),
      ('Reparos', 'Reparos e manutenção em geral'),
      ('Instalação', 'Instalação de equipamentos e sistemas'),
      ('Consultoria', 'Serviços de consultoria técnica'),
      ('Outros', 'Outros tipos de serviços');

      -- Inserir usuário de exemplo (prestador)
      INSERT OR IGNORE INTO users (name, email, password, phone, city, user_type) VALUES
      ('João Silva', 'joao@email.com', '$2b$10$example_hash', '(11) 99999-9999', 'São Paulo', 'prestador');

      -- Inserir usuário de exemplo (cliente)
      INSERT OR IGNORE INTO users (name, email, password, phone, city, user_type) VALUES
      ('Maria Santos', 'maria@email.com', '$2b$10$example_hash', '(11) 88888-8888', 'São Paulo', 'cliente');

      -- Inserir serviços de exemplo
      INSERT OR IGNORE INTO services (provider_id, category_id, title, description, price, price_type, city, rating, rating_count) VALUES
      (1, 3, 'Instalação de Ar Condicionado', 'Instalação profissional de ar condicionado com garantia', 500.00, 'fixo', 'São Paulo', 4.8, 15),
      (1, 2, 'Reparo de Eletrodomésticos', 'Reparo de geladeiras, máquinas de lavar e outros eletrodomésticos', 150.00, 'por_hora', 'São Paulo', 4.5, 8),
      (1, 1, 'Limpeza Residencial', 'Limpeza completa de residências', 80.00, 'por_hora', 'São Paulo', 4.9, 25);

      -- Inserir horários disponíveis para os serviços
      INSERT OR IGNORE INTO available_schedules (service_id, day_of_week, start_time, end_time) VALUES
      (1, 1, '08:00', '18:00'),
      (1, 2, '08:00', '18:00'),
      (1, 3, '08:00', '18:00'),
      (1, 4, '08:00', '18:00'),
      (1, 5, '08:00', '18:00'),
      (1, 6, '08:00', '14:00'),
      (2, 1, '09:00', '17:00'),
      (2, 2, '09:00', '17:00'),
      (2, 3, '09:00', '17:00'),
      (2, 4, '09:00', '17:00'),
      (2, 5, '09:00', '17:00'),
      (3, 1, '07:00', '19:00'),
      (3, 2, '07:00', '19:00'),
      (3, 3, '07:00', '19:00'),
      (3, 4, '07:00', '19:00'),
      (3, 5, '07:00', '19:00'),
      (3, 6, '07:00', '15:00'),
      (3, 0, '08:00', '12:00');
    `;

    await this.db.execAsync(seedData);
  }

  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    await this.initialize();
    if (!this.db || !this.isInitialized) {
      throw new Error('Banco de dados não inicializado. Chame initialize() primeiro.');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
