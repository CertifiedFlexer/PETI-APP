import { Appointment, CreateAppointmentData, TimeSlot } from '../types/appointments.types';

const API_URL = "https://peti-back.onrender.com";

// Configuración de horarios
const WORK_HOURS = {
    morning: { start: 7, end: 12 },
    afternoon: { start: 14, end: 20 }
};

const APPOINTMENT_DURATION = 60; // minutos

// ==========================================
// FUNCIONES DE API
// ==========================================

/**
 * Genera todos los slots de tiempo disponibles para un día
 */
export const generateTimeSlots = (): string[] => {
    const slots: string[] = [];

    // Horario de mañana: 7am - 12pm
    for (let hour = WORK_HOURS.morning.start; hour < WORK_HOURS.morning.end; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Horario de tarde: 2pm - 8pm
    for (let hour = WORK_HOURS.afternoon.start; hour < WORK_HOURS.afternoon.end; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    return slots;
};

/**
 * Obtener citas de un proveedor para una fecha específica
 * GET /api/appointments/provider/:providerId?date=YYYY-MM-DD
 */
export const getProviderAppointments = async (
    providerId: string,
    date: string,
    token: string
): Promise<Appointment[]> => {
    try {
        const url = new URL(`${API_URL}/api/appointments/provider/${providerId}`);
        url.searchParams.append('date', date);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(errorData.message || "Error al obtener las citas");
        }

        const data = await response.json();
        return data as Appointment[];
    } catch (error) {
        console.error('❌ Error al obtener citas del proveedor:', error);
        throw error;
    }
};

/**
 * Obtener disponibilidad de un proveedor para una fecha
 */
export const getProviderAvailability = async (
    providerId: string,
    date: string,
    token: string
): Promise<TimeSlot[]> => {
    try {
        const appointments = await getProviderAppointments(providerId, date, token);
        const allSlots = generateTimeSlots();

        const slotsWithAvailability: TimeSlot[] = allSlots.map(time => {
            const isOccupied = appointments.some(apt => apt.time === time);
            const appointment = appointments.find(apt => apt.time === time);

            return {
                time,
                available: !isOccupied,
                appointmentId: appointment?.id
            };
        });

        return slotsWithAvailability;
    } catch (error) {
        console.error('❌ Error al obtener disponibilidad:', error);
        return generateTimeSlots().map(time => ({ time, available: true }));
    }
};

/**
 * Crear una nueva cita
 * POST /api/appointments
 */
export const createAppointment = async (
    data: CreateAppointmentData,
    token: string
): Promise<Appointment> => {
    try {
        const response = await fetch(`${API_URL}/api/appointments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                providerId: data.providerId,
                providerName: data.providerName,
                providerCategory: data.providerCategory,
                userId: data.userId,
                userName: data.userName,
                date: data.date,
                time: data.time,
                duration: APPOINTMENT_DURATION,
                status: 'pending'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(errorData.message || "Error al crear la cita");
        }

        const result = await response.json();
        return result as Appointment;
    } catch (error) {
        console.error('❌ Error al crear la cita:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error al crear la cita');
    }
};

/**
 * Obtener citas del usuario
 * GET /api/appointments/user/:userId
 */
export const getUserAppointments = async (
    userId: string,
    token: string
): Promise<Appointment[]> => {
    try {
        const response = await fetch(
            `${API_URL}/api/appointments/user/${userId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(errorData.message || "Error al obtener las citas del usuario");
        }

        const data = await response.json();
        return data as Appointment[];
    } catch (error) {
        console.error('❌ Error al obtener citas del usuario:', error);
        throw error;
    }
};

/**
 * Obtener una cita por ID
 * GET /api/appointments/:id
 */
export const getAppointmentById = async (
    appointmentId: string,
    token: string
): Promise<Appointment> => {
    try {
        const response = await fetch(
            `${API_URL}/api/appointments/${appointmentId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(errorData.message || "Error al obtener la cita");
        }

        const data = await response.json();
        return data as Appointment;
    } catch (error) {
        console.error('❌ Error al obtener cita por ID:', error);
        throw error;
    }
};

/**
 * Actualizar el estado de una cita
 * PUT /api/appointments/:id/status
 */
export const updateAppointmentStatus = async (
    appointmentId: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
    token: string
): Promise<Appointment> => {
    try {
        const response = await fetch(
            `${API_URL}/api/appointments/${appointmentId}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(errorData.message || "Error al actualizar el estado de la cita");
        }

        const data = await response.json();
        return data as Appointment;
    } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
        throw error;
    }
};

/**
 * Cancelar una cita
 */
export const cancelAppointment = async (
    appointmentId: string,
    token: string
): Promise<void> => {
    try {
        await updateAppointmentStatus(appointmentId, 'cancelled', token);
    } catch (error) {
        console.error('❌ Error al cancelar la cita:', error);
        throw error;
    }
};

/**
 * Confirmar una cita
 */
export const confirmAppointment = async (
    appointmentId: string,
    token: string
): Promise<Appointment> => {
    try {
        return await updateAppointmentStatus(appointmentId, 'confirmed', token);
    } catch (error) {
        console.error('❌ Error al confirmar la cita:', error);
        throw error;
    }
};

/**
 * Completar una cita
 */
export const completeAppointment = async (
    appointmentId: string,
    token: string
): Promise<Appointment> => {
    try {
        return await updateAppointmentStatus(appointmentId, 'completed', token);
    } catch (error) {
        console.error('❌ Error al completar la cita:', error);
        throw error;
    }
};

// ==========================================
// UTILIDADES DE FORMATO Y VALIDACIÓN
// ==========================================

/**
 * Formatear fecha para mostrar
 */
export const formatDate = (dateString: string): string => {
    if (!dateString || typeof dateString !== 'string') {
        console.warn('⚠️ formatDate: fecha inválida', dateString);
        return '';
    }
    
    try {
        const dateWithTime = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
        const date = new Date(dateWithTime);
        
        if (isNaN(date.getTime())) {
            console.warn('⚠️ formatDate: fecha no parseable', dateString);
            return dateString;
        }
        
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('❌ Error en formatDate:', error);
        return '';
    }
};

/**
 * Formatear hora para mostrar (24hr a 12hr con AM/PM)
 */
export const formatTimeDisplay = (time24: string): string => {
    if (!time24 || typeof time24 !== 'string') {
        console.warn('⚠️ formatTimeDisplay: tiempo inválido', time24);
        return '';
    }

    try {
        if (!time24.includes(':')) {
            console.warn('⚠️ formatTimeDisplay: formato sin ":"', time24);
            return time24;
        }

        const [hoursStr, minutesStr] = time24.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        
        if (isNaN(hours) || isNaN(minutes)) {
            console.warn('⚠️ formatTimeDisplay: números inválidos', { hours, minutes });
            return time24;
        }

        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            console.warn('⚠️ formatTimeDisplay: fuera de rango', { hours, minutes });
            return time24;
        }
        
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
        console.error('❌ Error en formatTimeDisplay:', error);
        return '';
    }
};

/**
 * Validar si una fecha es válida para agendar (no en el pasado)
 */
export const isValidAppointmentDate = (date: string): boolean => {
    if (!date || typeof date !== 'string') {
        return false;
    }

    try {
        const selectedDate = new Date(date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(selectedDate.getTime())) {
            return false;
        }
        
        return selectedDate >= today;
    } catch (error) {
        console.error('❌ Error en isValidAppointmentDate:', error);
        return false;
    }
};