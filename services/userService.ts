import { databaseService } from './database';

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  cpf: string;
  user_type: 'cliente' | 'prestador';
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class UserService {
  private async ensureDatabaseInitialized() {
    await databaseService.initialize();
  }

  private async getDb() {
    return await databaseService.getDatabase();
  }

  // Validações
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): boolean {
    // Pelo menos 6 caracteres, uma letra e um número
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
  }

  private validatePhone(phone: string): boolean {
    // Formato brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    await this.ensureDatabaseInitialized();
    
    // Validações
    if (!this.validateEmail(userData.email)) {
      throw new Error('Email inválido');
    }

    if (!this.validatePassword(userData.password)) {
      throw new Error('Senha deve ter pelo menos 6 caracteres, incluindo uma letra e um número');
    }

    if (userData.phone && !this.validatePhone(userData.phone)) {
      throw new Error('Telefone deve estar no formato (XX) XXXXX-XXXX');
    }

    if (!userData.name.trim()) {
      throw new Error('Nome é obrigatório');
    }

    if (!['cliente', 'prestador'].includes(userData.user_type)) {
      throw new Error('Tipo de usuário deve ser "cliente" ou "prestador"');
    }

    try {
      const db = await this.getDb();
      const result = await db.runAsync(
        `INSERT INTO users (name, email, password, phone, city, cpf, user_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.name.trim(),
          userData.email.toLowerCase().trim(),
          userData.password, // Em produção, usar hash da senha
          userData.phone || null,
          userData.city || null,
          userData.cpf.trim(),
          userData.user_type
        ]
      );

      const newUser = await this.getUserById(result.lastInsertRowId as number);
      return newUser!;
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email já está em uso');
      }
      throw new Error('Erro ao criar usuário: ' + error.message);
    }
  }

  async login(credentials: LoginCredentials): Promise<User | null> {
    await this.ensureDatabaseInitialized();
    
    if (!this.validateEmail(credentials.email)) {
      throw new Error('Email inválido');
    }

    const db = await this.getDb();
    const user = await db.getFirstAsync<User>(
      `SELECT * FROM users WHERE email = ? AND password = ?`,
      [credentials.email.toLowerCase().trim(), credentials.password]
    );

    return user || null;
  }

  async getUserById(id: number): Promise<User | null> {
    await this.ensureDatabaseInitialized();
    
    const db = await this.getDb();
    const user = await db.getFirstAsync<User>(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );

    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureDatabaseInitialized();
    
    const db = await this.getDb();
    const user = await db.getFirstAsync<User>(
      `SELECT * FROM users WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    return user || null;
  }

  async updateUser(id: number, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    await this.ensureDatabaseInitialized();
    
    const updates: string[] = [];
    const values: any[] = [];

    if (userData.name !== undefined) {
      if (!userData.name.trim()) {
        throw new Error('Nome é obrigatório');
      }
      updates.push('name = ?');
      values.push(userData.name.trim());
    }

    if (userData.email !== undefined) {
      if (!this.validateEmail(userData.email)) {
        throw new Error('Email inválido');
      }
      updates.push('email = ?');
      values.push(userData.email.toLowerCase().trim());
    }

    if (userData.password !== undefined) {
      if (!this.validatePassword(userData.password)) {
        throw new Error('Senha deve ter pelo menos 6 caracteres, incluindo uma letra e um número');
      }
      updates.push('password = ?');
      values.push(userData.password);
    }

    if (userData.phone !== undefined) {
      if (userData.phone && !this.validatePhone(userData.phone)) {
        throw new Error('Telefone deve estar no formato (XX) XXXXX-XXXX');
      }
      updates.push('phone = ?');
      values.push(userData.phone || null);
    }

    if (userData.city !== undefined) {
      updates.push('city = ?');
      values.push(userData.city || null);
    }

    if (userData.user_type !== undefined) {
      if (!['cliente', 'prestador'].includes(userData.user_type)) {
        throw new Error('Tipo de usuário deve ser "cliente" ou "prestador"');
      }
      updates.push('user_type = ?');
      values.push(userData.user_type);
    }

    if (updates.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    try {
      const db = await this.getDb();
      await db.runAsync(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const updatedUser = await this.getUserById(id);
      return updatedUser!;
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email já está em uso');
      }
      throw new Error('Erro ao atualizar usuário: ' + error.message);
    }
  }

  async deleteUser(id: number): Promise<void> {
    await this.ensureDatabaseInitialized();
    const db = await this.getDb();
    await db.runAsync(`DELETE FROM users WHERE id = ?`, [id]);
  }

  async getAllUsers(): Promise<User[]> {
    await this.ensureDatabaseInitialized();
    const db = await this.getDb();
    const users = await db.getAllAsync<User>(`SELECT * FROM users ORDER BY created_at DESC`);
    return users;
  }

  async getUsersByType(userType: 'cliente' | 'prestador'): Promise<User[]> {
    await this.ensureDatabaseInitialized();
    const db = await this.getDb();
    const users = await db.getAllAsync<User>(
      `SELECT * FROM users WHERE user_type = ? ORDER BY created_at DESC`,
      [userType]
    );
    return users;
  }
}

export const userService = new UserService();
