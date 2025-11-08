import { Appointment, CreateAppointmentData, TimeSlot } from '../types/appointments.types';

const API_URL = "http://localhost:3000";
const WORK_HOURS = {
    morning: { start: 7, end: 12 },
    afternoon: { start: 14, end: 20 }
};
const APPOINTMENT_DURATION = 60;

export const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = WORK_HOURS.morning.start; hour < WORK_HOURS.morning.end; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    for (let hour = WORK_HOURS.afternoon.start; hour < WORK_HOURS.afternoon.end; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
};

export const getProviderAppointments = async (
    providerId: string,
    date: string,
    token: string
): Promise<Appointment[]> => {
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
    if (!response.ok) throw new Error("Error al obtener las citas");
    return await response.json();
};

export const getProviderAvailability = async (
    providerId: string,
    date: string,
    token: string
): Promise<TimeSlot[]> => {
    try {
        const appointments = await getProviderAppointments(providerId, date, token);
        const allSlots = generateTimeSlots();
        return allSlots.map(time => {
            const appointment = appointments.find(apt => apt.time === time);
            return {
                time,
                available: !appointment,
                appointmentId: appointment?.id
            };
        });
    } catch {
        return generateTimeSlots().map(time => ({ time, available: true }));
    }
};

export const createAppointment = async (
    data: CreateAppointmentData,
    token: string
): Promise<Appointment> => {
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
    return await response.json();
};

export const getUserAppointments = async (
    userId: string,
    token: string
): Promise<Appointment[]> => {
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
    if (!response.ok) throw new Error("Error al obtener las citas del usuario");
    return await response.json();
};

export const cancelAppointment = async (
    appointmentId: string,
    token: string
): Promise<void> => {
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
    if (!response.ok) throw new Error("Error al cancelar la cita");
};

export const formatDate = (dateString: string): string => {
    if (!dateString || typeof dateString !== 'string') return '';
    try {
        const dateWithTime = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
        const date = new Date(dateWithTime);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return '';
    }
};

export const formatTimeDisplay = (time24: string): string => {
    if (!time24 || typeof time24 !== 'string' || !time24.includes(':')) return time24;
    try {
        const [hoursStr, minutesStr] = time24.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return time24;
        }
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
        return '';
    }
};

export const isValidAppointmentDate = (date: string): boolean => {
    if (!date || typeof date !== 'string') return false;
    try {
        const selectedDate = new Date(date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(selectedDate.getTime())) return false;
        return selectedDate >= today;
    } catch {
        return false;
    }
};