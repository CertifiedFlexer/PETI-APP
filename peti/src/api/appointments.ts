import { Appointment, CreateAppointmentData, TimeSlot } from '../types/appointments.types';

const API_URL = "http://localhost:3000";
const USE_MOCK_DATA = true; //  Cambiar a false cuando el backend esté listo

//  STORAGE EN MEMORIA (Compatible con React Native)
let mockAppointmentsStorage: Appointment[] = [];

// Horarios de trabajo: 7am-12pm y 2pm-8pm
const WORK_HOURS = {
    morning: { start: 7, end: 12 },
    afternoon: { start: 14, end: 20 }
};

const APPOINTMENT_DURATION = 60; // minutos

// ==========================================
//  FUNCIONES MOCK (SIMULACIÓN EN MEMORIA)
// ==========================================

/**
 * Obtener todas las citas desde memoria
 */
const getMockAppointments = (): Appointment[] => {
    return [...mockAppointmentsStorage];
};

/**
 * Guardar citas en memoria
 */
const saveMockAppointments = (appointments: Appointment[]): void => {
    mockAppointmentsStorage = [...appointments];
    console.log(' Citas guardadas en memoria:', appointments.length);
};

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
 */
export const getProviderAppointments = async (
    providerId: string,
    date: string,
    token: string
): Promise<Appointment[]> => {
    //  MODO MOCK
    if (USE_MOCK_DATA) {
        console.log(' MOCK: Obteniendo citas del proveedor', providerId, 'para', date);
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const allAppointments = getMockAppointments();
        const filtered = allAppointments.filter(apt => 
            apt.providerId === providerId && 
            apt.date === date &&
            apt.status !== 'cancelled'
        );
        
        console.log(' Citas encontradas:', filtered.length);
        return filtered;
    }

    //  MODO REAL (Backend)
    try {
        const response = await fetch(
            `${API_URL}/api/appointments/provider/${providerId}?date=${date}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Error al obtener las citas");
        }

        const data = await response.json();
        return data as Appointment[];
    } catch (error) {
        console.error('Error fetching appointments:', error);
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
        // Obtener todas las citas del proveedor para esa fecha
        const appointments = await getProviderAppointments(providerId, date, token);

        // Generar todos los slots posibles
        const allSlots = generateTimeSlots();

        // Marcar slots ocupados
        const slotsWithAvailability: TimeSlot[] = allSlots.map(time => {
            const isOccupied = appointments.some(apt => apt.time === time);
            const appointment = appointments.find(apt => apt.time === time);

            return {
                time,
                available: !isOccupied,
                appointmentId: appointment?.id
            };
        });

        console.log(' Disponibilidad:', slotsWithAvailability.filter(s => !s.available).length, 'ocupados de', allSlots.length);
        return slotsWithAvailability;
    } catch (error) {
        console.error('Error fetching availability:', error);
        // Si hay error, retornar todos los slots como disponibles (fallback)
        return generateTimeSlots().map(time => ({ time, available: true }));
    }
};

/**
 * Crear una nueva cita
 */
export const createAppointment = async (
    data: CreateAppointmentData,
    token: string
): Promise<Appointment> => {
    //  MODO MOCK
    if (USE_MOCK_DATA) {
        console.log(' MOCK: Creando cita...');
        console.log(' Datos:', data);
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Obtener citas existentes
        const allAppointments = getMockAppointments();
        
        // Verificar si ya existe una cita en ese horario
        const existingAppointment = allAppointments.find(apt => 
            apt.providerId === data.providerId && 
            apt.date === data.date && 
            apt.time === data.time &&
            apt.status !== 'cancelled'
        );
        
        if (existingAppointment) {
            throw new Error('Este horario ya está ocupado');
        }
        
        // Crear nueva cita
        const newAppointment: Appointment = {
            id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...data,
            duration: APPOINTMENT_DURATION,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        // Guardar
        allAppointments.push(newAppointment);
        saveMockAppointments(allAppointments);
        
        console.log(' MOCK: Cita creada exitosamente:', newAppointment.id);
        console.log(' Total de citas en sistema:', allAppointments.length);
        
        return newAppointment;
    }

    //  MODO REAL (Backend)
    try {
        const response = await fetch(`${API_URL}/api/appointments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                ...data,
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
        console.error('Error creating appointment:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error al crear la cita');
    }
};

/**
 * Obtener citas del usuario
 */
export const getUserAppointments = async (
    userId: string,
    token: string
): Promise<Appointment[]> => {
    //  MODO MOCK
    if (USE_MOCK_DATA) {
        console.log(' MOCK: Obteniendo citas del usuario', userId);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const allAppointments = getMockAppointments();
        const userAppointments = allAppointments.filter(apt => 
            apt.userId === userId && 
            apt.status !== 'cancelled'
        );
        
        console.log(' Citas del usuario:', userAppointments.length);
        return userAppointments;
    }

    //  MODO REAL (Backend)
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
            throw new Error("Error al obtener las citas del usuario");
        }

        const data = await response.json();
        return data as Appointment[];
    } catch (error) {
        console.error('Error fetching user appointments:', error);
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
    //  MODO MOCK
    if (USE_MOCK_DATA) {
        console.log(' MOCK: Cancelando cita', appointmentId);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const allAppointments = getMockAppointments();
        const appointmentIndex = allAppointments.findIndex(apt => apt.id === appointmentId);
        
        if (appointmentIndex === -1) {
            throw new Error('Cita no encontrada');
        }
        
        // Marcar como cancelada
        allAppointments[appointmentIndex].status = 'cancelled';
        saveMockAppointments(allAppointments);
        
        console.log(' MOCK: Cita cancelada exitosamente');
        return;
    }

    //  MODO REAL (Backend)
    try {
        const response = await fetch(
            `${API_URL}/api/appointments/${appointmentId}/cancel`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Error al cancelar la cita");
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        throw error;
    }
};

/**
 * Formatear fecha para mostrar
 *  VERSION CORREGIDA - Con validación robusta
 */
export const formatDate = (dateString: string): string => {
    // Validación inicial
    if (!dateString || typeof dateString !== 'string') {
        console.warn(' formatDate: fecha inválida', dateString);
        return '';
    }
    
    try {
        // Asegurar formato correcto agregando hora
        const dateWithTime = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
        const date = new Date(dateWithTime);
        
        // Validar que la fecha sea válida
        if (isNaN(date.getTime())) {
            console.warn(' formatDate: fecha no parseable', dateString);
            return dateString;
        }
        
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error(' Error en formatDate:', error);
        return '';
    }
};

/**
 * Formatear hora para mostrar (24hr a 12hr con AM/PM)
 *  VERSION CORREGIDA - Con validación robusta
 */
export const formatTimeDisplay = (time24: string): string => {
    // Validación inicial
    if (!time24 || typeof time24 !== 'string') {
        console.warn(' formatTimeDisplay: tiempo inválido', time24);
        return '';
    }

    try {
        // Validar formato básico
        if (!time24.includes(':')) {
            console.warn(' formatTimeDisplay: formato sin ":"', time24);
            return time24;
        }

        const [hoursStr, minutesStr] = time24.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        
        // Validar que sean números válidos
        if (isNaN(hours) || isNaN(minutes)) {
            console.warn(' formatTimeDisplay: números inválidos', { hours, minutes });
            return time24;
        }

        // Validar rangos
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            console.warn(' formatTimeDisplay: fuera de rango', { hours, minutes });
            return time24;
        }
        
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
        console.error(' Error en formatTimeDisplay:', error);
        return '';
    }
};

/**
 * Validar si una fecha es válida para agendar (no en el pasado)
 *  VERSION CORREGIDA - Con validación robusta
 */
export const isValidAppointmentDate = (date: string): boolean => {
    if (!date || typeof date !== 'string') {
        return false;
    }

    try {
        const selectedDate = new Date(date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Validar que la fecha sea válida
        if (isNaN(selectedDate.getTime())) {
            return false;
        }
        
        return selectedDate >= today;
    } catch (error) {
        console.error(' Error en isValidAppointmentDate:', error);
        return false;
    }
};

// ==========================================
//  UTILIDADES DE DESARROLLO
// ==========================================

/**
 * Limpiar todas las citas mock (útil para desarrollo)
 */
export const clearMockAppointments = (): void => {
    if (USE_MOCK_DATA) {
        mockAppointmentsStorage = [];
        console.log(' Todas las citas mock han sido eliminadas');
    }
};

/**
 * Ver todas las citas mock (útil para desarrollo)
 */
export const debugMockAppointments = (): void => {
    if (USE_MOCK_DATA) {
        const appointments = getMockAppointments();
        console.log(' DEBUG: Citas en sistema:', appointments);
        console.log(' Total:', appointments.length);
    }
};

/**
 * Crear citas de prueba
 */
export const createTestAppointments = (): void => {
    if (USE_MOCK_DATA) {
        const testAppointments: Appointment[] = [
            {
                id: 'test-1',
                providerId: '1',
                providerName: 'PetShop Central',
                providerCategory: 'Tienda',
                userId: 'user-001',
                userName: 'Juan Pérez',
                date: '2025-10-30',
                time: '10:00',
                duration: 60,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            },
            {
                id: 'test-2',
                providerId: '1',
                providerName: 'PetShop Central',
                providerCategory: 'Tienda',
                userId: 'user-002',
                userName: 'María García',
                date: '2025-10-30',
                time: '14:00',
                duration: 60,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            }
        ];
        
        saveMockAppointments(testAppointments);
        console.log(' Se crearon citas de prueba');
    }
};