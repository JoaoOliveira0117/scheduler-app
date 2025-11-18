import { databaseService } from './database';

export interface AvailableSchedule {
  id?: number;
  service_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available?: boolean;
  created_at?: string;
}

export interface Appointment {
  id?: number;
  client_id: number;
  service_id: number;
  scheduled_date: string;
  scheduled_time: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  client_name?: string;
  service_title?: string;
  provider_name?: string;
}

export class ScheduleService {
  private async getDb() {
    return await databaseService.getDatabase();
  }

  private validateTime(time: string) {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  private validateDate(date: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }

  private validateDayOfWeek(day: number) {
    return day >= 0 && day <= 6;
  }

  // ===========================
  // CRIAR HORÁRIO DISPONÍVEL
  // ===========================
  async createAvailableSchedule(scheduleData: Omit<AvailableSchedule, 'id' | 'created_at'>): Promise<AvailableSchedule> {
    const db = await this.getDb();

    if (!this.validateDayOfWeek(scheduleData.day_of_week))
      throw new Error("Dia da semana inválido.");

    if (!this.validateTime(scheduleData.start_time) || !this.validateTime(scheduleData.end_time))
      throw new Error("Horário inválido (use HH:MM).");

    if (scheduleData.start_time >= scheduleData.end_time)
      throw new Error("Horário inicial deve ser antes do final.");

    const service = await db.getFirstAsync(`SELECT id FROM services WHERE id = ?`, [scheduleData.service_id]);
    if (!service) throw new Error("Serviço não encontrado.");

    const result = await db.runAsync(
      `INSERT INTO available_schedules
        (service_id, day_of_week, start_time, end_time, is_available)
       VALUES (?, ?, ?, ?, ?)`,
      [
        scheduleData.service_id,
        scheduleData.day_of_week,
        scheduleData.start_time,
        scheduleData.end_time,
        scheduleData.is_available !== false ? 1 : 0
      ]
    );

    return await this.getAvailableScheduleById(result.lastInsertRowId as number) as AvailableSchedule;
  }

  async getAvailableScheduleById(id: number) {
    const db = await this.getDb();
    return await db.getFirstAsync(`SELECT * FROM available_schedules WHERE id = ?`, [id]);
  }

  async getAvailableSchedulesByService(serviceId: number) {
    const db = await this.getDb();
    return await db.getAllAsync(
      `SELECT * FROM available_schedules
       WHERE service_id = ? AND is_available = 1
       ORDER BY day_of_week, start_time`,
      [serviceId]
    );
  }

  // ===========================
  // CRIAR AGENDAMENTO
  // ===========================
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
    const db = await this.getDb();

    if (!this.validateDate(appointmentData.scheduled_date))
      throw new Error("Data inválida.");

    if (!this.validateTime(appointmentData.scheduled_time))
      throw new Error("Horário inválido.");

    const existing = await db.getFirstAsync(
      `SELECT id FROM appointments
       WHERE service_id = ? AND scheduled_date = ? AND scheduled_time = ?
         AND status NOT IN ('cancelado', 'concluido')`,
      [appointmentData.service_id, appointmentData.scheduled_date, appointmentData.scheduled_time]
    );

    if (existing)
      throw new Error("Já existe um agendamento neste horário.");

    await db.runAsync(
      `INSERT INTO appointments
        (client_id, service_id, scheduled_date, scheduled_time, status, notes)
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
  }

  // =====================================================
  // HORÁRIOS DISPONÍVEIS COM BLOQUEIO POR DURAÇÃO REAL
  // =====================================================
  async getAvailableTimesForDate(serviceId: number, date: string): Promise<string[]> {
    const db = await this.getDb();
    const dayOfWeek = new Date(date).getDay();

    const schedules = await db.getAllAsync<AvailableSchedule>(
      `SELECT * FROM available_schedules
       WHERE service_id = ? AND day_of_week = ? AND is_available = 1`,
      [serviceId, dayOfWeek]
    );

    if (schedules.length === 0) return [];

    const service = await db.getFirstAsync(`SELECT duration FROM services WHERE id = ?`, [serviceId]);
    const duration = service?.duration ?? 30;

    const appointments = await db.getAllAsync<Appointment>(
      `SELECT scheduled_time FROM appointments
       WHERE service_id = ? AND scheduled_date = ?
         AND status NOT IN ('cancelado', 'concluido')`,
      [serviceId, date]
    );

    const booked = appointments.map((a) => {
      const [h, m] = a.scheduled_time.split(":").map(Number);
      return h * 60 + m;
    });

    const available: string[] = [];

    for (const s of schedules) {
      const [sh, sm] = s.start_time.split(":").map(Number);
      const [eh, em] = s.end_time.split(":").map(Number);

      let current = sh * 60 + sm;
      const end = eh * 60 + em;

      while (current + duration <= end) {
        const timeStr = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;
        const currentEnd = current + duration;

        const overlaps = booked.some((b) => {
          const bEnd = b + duration;
          return (
            (current >= b && current < bEnd) ||
            (b >= current && b < currentEnd)
          );
        });

        if (!overlaps) available.push(timeStr);

        current += 30; // incrementa 30 min
      }
    }

    return available.sort();
  }

  // =====================================================
  // AGENDAMENTOS DO CLIENTE
  // =====================================================
  async getAppointmentsByClient(clientId: number) {
    const db = await this.getDb();

    return await db.getAllAsync<Appointment>(
      `SELECT a.*, s.title AS service_title, u.name AS provider_name
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       JOIN users u ON u.id = s.provider_id
      WHERE a.client_id = ?
      ORDER BY a.scheduled_date DESC, a.scheduled_time DESC`,
      [clientId]
    );
  }

  // =====================================================
  // AGENDAMENTOS DO PRESTADOR
  // =====================================================
  async getAppointmentsByProvider(providerId: number) {
    const db = await this.getDb();

    return await db.getAllAsync<Appointment>(
      `SELECT a.*, s.title AS service_title, u.name AS client_name
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       JOIN users u ON u.id = a.client_id
      WHERE s.provider_id = ?
      ORDER BY a.scheduled_date DESC, a.scheduled_time DESC`,
      [providerId]
    );
  }
}

export const scheduleService = new ScheduleService();
