export interface Appointment {
    id: string;
    providerId: string;
    providerName: string;
    providerCategory: string;
    userId: string;
    userName: string;
    date: string; // Format: YYYY-MM-DD
    time: string; // Format: HH:mm (24hr)
    duration: number; // minutes
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    createdAt?: string; // Opcional
}

export interface CreateAppointmentData {
    providerId: string;
    providerName: string;
    providerCategory: string;
    userId: string;
    userName: string;
    date: string;
    time: string;
    duration: number;
}

export interface TimeSlot {
    time: string;
    available: boolean;
    appointmentId?: string;
}

export interface AvailabilityResponse {
    date: string;
    slots: TimeSlot[];
}