import { databaseService } from './database';

export interface AvailableSchedule {
  id?: number;
  service_id: number;
  day_of_week: number; // 0 = domingo, 6 = sábado
  start_time: string; // formato HH:MM
  end_time: string; // formato HH:MM
  is_available?: boolean;
  created_at?: string;
}

export interface Appointment {
  id?: number;
  client_id: number;
  service_id: number;
  scheduled_date: string; // formato YYYY-MM-DD
  scheduled_time: string; // formato HH:MM
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Campos relacionados
  client_name?: string;
  service_title?: string;
  provider_name?: string;
}

export class ScheduleService {
  private async getDb() {
    return await databaseService.getDatabase();
  }

  // Validações
  private validateTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private validateDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  }

  private validateDayOfWeek(day: number): boolean {
    return day >= 0 && day <= 6;
  }

  // Métodos para horários disponíveis
  async createAvailableSchedule(scheduleData: Omit<AvailableSchedule, 'id' | 'created_at'>): Promise<AvailableSchedule> {
    const db = await this.getDb();
    
    // Validações
    if (!this.validateDayOfWeek(scheduleData.day_of_week)) {
      throw new Error('Dia da semana deve ser entre 0 (domingo) e 6 (sábado)');
    }

    if (!this.validateTime(scheduleData.start_time)) {
      throw new Error('Horário de início inválido (formato HH:MM)');
    }

    if (!this.validateTime(scheduleData.end_time)) {
      throw new Error('Horário de fim inválido (formato HH:MM)');
    }

    if (scheduleData.start_time >= scheduleData.end_time) {
      throw new Error('Horário de início deve ser anterior ao horário de fim');
    }

    // Verificar se o serviço existe
    const service = await db.getFirstAsync(
      `SELECT id FROM services WHERE id = ?`,
      [scheduleData.service_id]
    );

    if (!service) {
      throw new Error('Serviço não encontrado');
    }

    try {
      const result = await db.runAsync(
        `INSERT INTO available_schedules (service_id, day_of_week, start_time, end_time, is_available) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          scheduleData.service_id,
          scheduleData.day_of_week,
          scheduleData.start_time,
          scheduleData.end_time,
          scheduleData.is_available !== false ? 1 : 0
        ]
      );

      const newSchedule = await this.getAvailableScheduleById(result.lastInsertRowId as number);
      return newSchedule!;
    } catch (error: any) {
      throw new Error('Erro ao criar horário disponível: ' + error.message);
    }
  }

  async getAvailableScheduleById(id: number): Promise<AvailableSchedule | null> {
    const db = await this.getDb();
    
    const schedule = await db.getFirstAsync<AvailableSchedule>(
      `SELECT * FROM available_schedules WHERE id = ?`,
      [id]
    );

    return schedule || null;
  }

  async getAvailableSchedulesByService(serviceId: number): Promise<AvailableSchedule[]> {
    const db = await this.getDb();
    
    const schedules = await db.getAllAsync<AvailableSchedule>(
      `SELECT * FROM available_schedules 
       WHERE service_id = ? AND is_available = 1 
       ORDER BY day_of_week, start_time`,
      [serviceId]
    );
    return schedules;
  }

  async updateAvailableSchedule(id: number, scheduleData: Partial<Omit<AvailableSchedule, 'id' | 'service_id' | 'created_at'>>): Promise<AvailableSchedule> {
    const db = await this.getDb();
    const updates: string[] = [];
    const values: any[] = [];

    if (scheduleData.day_of_week !== undefined) {
      if (!this.validateDayOfWeek(scheduleData.day_of_week)) {
        throw new Error('Dia da semana deve ser entre 0 (domingo) e 6 (sábado)');
      }
      updates.push('day_of_week = ?');
      values.push(scheduleData.day_of_week);
    }

    if (scheduleData.start_time !== undefined) {
      if (!this.validateTime(scheduleData.start_time)) {
        throw new Error('Horário de início inválido (formato HH:MM)');
      }
      updates.push('start_time = ?');
      values.push(scheduleData.start_time);
    }

    if (scheduleData.end_time !== undefined) {
      if (!this.validateTime(scheduleData.end_time)) {
        throw new Error('Horário de fim inválido (formato HH:MM)');
      }
      updates.push('end_time = ?');
      values.push(scheduleData.end_time);
    }

    if (scheduleData.is_available !== undefined) {
      updates.push('is_available = ?');
      values.push(scheduleData.is_available ? 1 : 0);
    }

    if (updates.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    values.push(id);

    try {
      await db.runAsync(
        `UPDATE available_schedules SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const updatedSchedule = await this.getAvailableScheduleById(id);
      return updatedSchedule!;
    } catch (error: any) {
      throw new Error('Erro ao atualizar horário disponível: ' + error.message);
    }
  }

  async deleteAvailableSchedule(id: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(`DELETE FROM available_schedules WHERE id = ?`, [id]);
  }

  // Métodos para agendamentos
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const db = await this.getDb();
    
    // Validações
    if (!this.validateDate(appointmentData.scheduled_date)) {
      throw new Error('Data inválida (formato YYYY-MM-DD)');
    }

    if (!this.validateTime(appointmentData.scheduled_time)) {
      throw new Error('Horário inválido (formato HH:MM)');
    }

    if (!['agendado', 'confirmado', 'cancelado', 'concluido'].includes(appointmentData.status)) {
      throw new Error('Status inválido');
    }

    // Verificar se cliente e serviço existem
    const [client, service] = await Promise.all([
      db.getFirstAsync(`SELECT id FROM users WHERE id = ?`, [appointmentData.client_id]),
      db.getFirstAsync(`SELECT id FROM services WHERE id = ?`, [appointmentData.service_id])
    ]);

    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    if (!service) {
      throw new Error('Serviço não encontrado');
    }

    // Verificar se já existe agendamento no mesmo horário
    const existingAppointment = await db.getFirstAsync(
      `SELECT id FROM appointments 
       WHERE service_id = ? AND scheduled_date = ? AND scheduled_time = ? 
       AND status NOT IN ('cancelado', 'concluido')`,
      [appointmentData.service_id, appointmentData.scheduled_date, appointmentData.scheduled_time]
    );

    if (existingAppointment) {
      throw new Error('Já existe um agendamento neste horário');
    }

    try {
      const result = await db.runAsync(
        `INSERT INTO appointments (client_id, service_id, scheduled_date, scheduled_time, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          appointmentData.client_id,
          appointmentData.service_id,
          appointmentData.scheduled_date,
          appointmentData.scheduled_time,
          appointmentData.status,
          appointmentData.notes || null
        ]
      );

      const newAppointment = await this.getAppointmentById(result.lastInsertRowId as number);
      return newAppointment!;
    } catch (error: any) {
      throw new Error('Erro ao criar agendamento: ' + error.message);
    }
  }

  async getAppointmentById(id: number): Promise<Appointment | null> {
    const db = await this.getDb();
    
    const appointment = await db.getFirstAsync<Appointment>(
      `SELECT a.*, u.name as client_name, s.title as service_title, p.name as provider_name
       FROM appointments a
       LEFT JOIN users u ON a.client_id = u.id
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN users p ON s.provider_id = p.id
       WHERE a.id = ?`,
      [id]
    );

    return appointment || null;
  }

  async getAppointmentsByClient(clientId: number): Promise<Appointment[]> {
    const db = await this.getDb();
    
    const appointments = await db.getAllAsync<Appointment>(
      `SELECT a.*, u.name as client_name, s.title as service_title, p.name as provider_name
       FROM appointments a
       LEFT JOIN users u ON a.client_id = u.id
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN users p ON s.provider_id = p.id
       WHERE a.client_id = ?
       ORDER BY a.scheduled_date DESC, a.scheduled_time DESC`,
      [clientId]
    );
    return appointments;
  }

  async getAppointmentsByService(serviceId: number): Promise<Appointment[]> {
    const db = await this.getDb();
    
    const appointments = await db.getAllAsync<Appointment>(
      `SELECT a.*, u.name as client_name, s.title as service_title, p.name as provider_name
       FROM appointments a
       LEFT JOIN users u ON a.client_id = u.id
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN users p ON s.provider_id = p.id
       WHERE a.service_id = ?
       ORDER BY a.scheduled_date DESC, a.scheduled_time DESC`,
      [serviceId]
    );
    return appointments;
  }

  async updateAppointment(id: number, appointmentData: Partial<Omit<Appointment, 'id' | 'client_id' | 'service_id' | 'created_at' | 'updated_at'>>): Promise<Appointment> {
    const db = await this.getDb();
    const updates: string[] = [];
    const values: any[] = [];

    if (appointmentData.scheduled_date !== undefined) {
      if (!this.validateDate(appointmentData.scheduled_date)) {
        throw new Error('Data inválida (formato YYYY-MM-DD)');
      }
      updates.push('scheduled_date = ?');
      values.push(appointmentData.scheduled_date);
    }

    if (appointmentData.scheduled_time !== undefined) {
      if (!this.validateTime(appointmentData.scheduled_time)) {
        throw new Error('Horário inválido (formato HH:MM)');
      }
      updates.push('scheduled_time = ?');
      values.push(appointmentData.scheduled_time);
    }

    if (appointmentData.status !== undefined) {
      if (!['agendado', 'confirmado', 'cancelado', 'concluido'].includes(appointmentData.status)) {
        throw new Error('Status inválido');
      }
      updates.push('status = ?');
      values.push(appointmentData.status);
    }

    if (appointmentData.notes !== undefined) {
      updates.push('notes = ?');
      values.push(appointmentData.notes || null);
    }

    if (updates.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    try {
      await db.runAsync(
        `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const updatedAppointment = await this.getAppointmentById(id);
      return updatedAppointment!;
    } catch (error: any) {
      throw new Error('Erro ao atualizar agendamento: ' + error.message);
    }
  }

  async deleteAppointment(id: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(`DELETE FROM appointments WHERE id = ?`, [id]);
  }

  // Método para verificar horários disponíveis em uma data específica
  async getAvailableTimesForDate(serviceId: number, date: string): Promise<string[]> {
    const db = await this.getDb();
    const dayOfWeek = new Date(date).getDay();
    
    const schedules = await db.getAllAsync<AvailableSchedule>(
      `SELECT * FROM available_schedules 
       WHERE service_id = ? AND day_of_week = ? AND is_available = 1`,
      [serviceId, dayOfWeek]
    );

    const appointments = await db.getAllAsync<Appointment>(
      `SELECT scheduled_time FROM appointments 
       WHERE service_id = ? AND scheduled_date = ? 
       AND status NOT IN ('cancelado', 'concluido')`,
      [serviceId, date]
    );

    const bookedTimes = new Set(appointments.map((apt: Appointment) => apt.scheduled_time));
    const availableTimes: string[] = [];

    schedules.forEach((schedule: AvailableSchedule) => {
      const startTime = schedule.start_time;
      const endTime = schedule.end_time;
      
      // Gerar horários de 30 em 30 minutos
      let currentTime = startTime;
      while (currentTime < endTime) {
        if (!bookedTimes.has(currentTime)) {
          availableTimes.push(currentTime);
        }
        
        // Adicionar 30 minutos
        const [hours, minutes] = currentTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + 30;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
      }
    });

    return availableTimes.sort();
  }
}

export const scheduleService = new ScheduleService();
