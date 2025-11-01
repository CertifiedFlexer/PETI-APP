import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { createAppointment, formatTimeDisplay, getProviderAvailability } from "../api/appointments";
import { useAuth } from "../context/AuthContext";
import { TimeSlot } from "../types/appointments.types";

interface AppointmentModalProps {
    visible: boolean;
    onClose: () => void;
    provider: {
        id: string;
        name: string;
        category: string;
    };
}

export default function AppointmentModal({ visible, onClose, provider }: AppointmentModalProps) {
    const { user, token } = useAuth();
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Fecha mínima (hoy)
    const today = new Date().toISOString().split('T')[0];

    // Resetear estado al cerrar
    useEffect(() => {
        if (!visible) {
            setSelectedDate("");
            setSelectedTime("");
            setTimeSlots([]);
        }
    }, [visible]);

    // Cargar disponibilidad cuando se selecciona una fecha
    const loadAvailability = useCallback(async () => {
        if (!selectedDate || !token) return;
        
        setLoading(true);
        setSelectedTime("");
        try {
            const slots = await getProviderAvailability(provider.id, selectedDate, token);
            setTimeSlots(slots);
        } catch (error) {
            console.error('Error loading availability:', error);
            // En caso de error, mostramos los slots disponibles por defecto
            setTimeSlots([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, token, provider.id]);

    useEffect(() => {
        if (selectedDate && token) {
            loadAvailability();
        }
    }, [selectedDate, token, loadAvailability]);

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
    };

    const handleConfirmAppointment = () => {
        console.log('🔵 Abriendo modal de confirmación');
        if (!selectedDate || !selectedTime) {
            console.log('❌ Error: Falta fecha u hora');
            return;
        }
        if (!user || !token) {
            console.log('❌ Error: No hay sesión');
            return;
        }
        setShowConfirmModal(true);
    };

    const handleCreateAppointment = async () => {
        setShowConfirmModal(false);
        setIsBooking(true);
        try {
            const appointmentData = {
                providerId: provider.id,
                providerName: provider.name,
                providerCategory: provider.category,
                userId: user!.userId,
                userName: user!.name,
                date: selectedDate,
                time: selectedTime,
                duration: 60
            };
            
            console.log('📤 Enviando datos:', appointmentData);
            
            await createAppointment(appointmentData, token!);

            console.log('✅ Cita creada exitosamente');
            
            // Cerrar modal y resetear
            onClose();
        } catch (error) {
            console.error('❌ Error al crear cita:', error);
            // Aquí podrías mostrar otro modal de error si quieres
        } finally {
            setIsBooking(false);
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const markedDates = selectedDate ? {
        [selectedDate]: {
            selected: true,
            selectedColor: '#4CAF50'
        }
    } : {};

    return (
        <>
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Agendar Cita</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle" size={28} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Información del proveedor */}
                        <View style={styles.providerInfo}>
                            <Ionicons name="business" size={24} color="#4CAF50" />
                            <View style={styles.providerText}>
                                <Text style={styles.providerName}>{provider.name}</Text>
                                <Text style={styles.providerCategory}>{provider.category}</Text>
                            </View>
                        </View>

                        {/* Calendario */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
                            <Calendar
                                onDayPress={(day) => handleDateSelect(day.dateString)}
                                markedDates={markedDates}
                                minDate={today}
                                theme={{
                                    todayTextColor: '#4CAF50',
                                    arrowColor: '#4CAF50',
                                    monthTextColor: '#1A1A1A',
                                    textMonthFontWeight: 'bold',
                                    textDayFontSize: 16,
                                    textMonthFontSize: 18,
                                }}
                            />
                        </View>

                        {/* Horarios disponibles */}
                        {selectedDate && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Horarios disponibles
                                </Text>
                                <Text style={styles.dateSubtitle}>
                                    {formatDate(selectedDate)}
                                </Text>

                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color="#4CAF50" />
                                        <Text style={styles.loadingText}>Cargando horarios...</Text>
                                    </View>
                                ) : timeSlots.length > 0 ? (
                                    <>
                                        {/* Horario de mañana */}
                                        <Text style={styles.timeBlockTitle}>Mañana 7:00 AM - 12:00 PM</Text>
                                        <View style={styles.timeSlotsGrid}>
                                            {timeSlots
                                                .filter(slot => {
                                                    const hour = parseInt(slot.time.split(':')[0]);
                                                    return hour >= 7 && hour < 12;
                                                })
                                                .map((slot) => (
                                                    <TouchableOpacity
                                                        key={slot.time}
                                                        style={[
                                                            styles.timeSlot,
                                                            !slot.available && styles.timeSlotOccupied,
                                                            selectedTime === slot.time && styles.timeSlotSelected
                                                        ]}
                                                        onPress={() => slot.available && handleTimeSelect(slot.time)}
                                                        disabled={!slot.available}
                                                    >
                                                        <Text style={[
                                                            styles.timeSlotText,
                                                            !slot.available && styles.timeSlotTextOccupied,
                                                            selectedTime === slot.time && styles.timeSlotTextSelected
                                                        ]}>
                                                            {formatTimeDisplay(slot.time)}
                                                        </Text>
                                                        {!slot.available && (
                                                            <Ionicons name="lock-closed" size={14} color="#999" />
                                                        )}
                                                    </TouchableOpacity>
                                                ))}
                                        </View>

                                        {/* Horario de tarde */}
                                        <Text style={styles.timeBlockTitle}>Tarde 2:00 PM - 8:00 PM</Text>
                                        <View style={styles.timeSlotsGrid}>
                                            {timeSlots
                                                .filter(slot => {
                                                    const hour = parseInt(slot.time.split(':')[0]);
                                                    return hour >= 14 && hour < 20;
                                                })
                                                .map((slot) => (
                                                    <TouchableOpacity
                                                        key={slot.time}
                                                        style={[
                                                            styles.timeSlot,
                                                            !slot.available && styles.timeSlotOccupied,
                                                            selectedTime === slot.time && styles.timeSlotSelected
                                                        ]}
                                                        onPress={() => slot.available && handleTimeSelect(slot.time)}
                                                        disabled={!slot.available}
                                                    >
                                                        <Text style={[
                                                            styles.timeSlotText,
                                                            !slot.available && styles.timeSlotTextOccupied,
                                                            selectedTime === slot.time && styles.timeSlotTextSelected
                                                        ]}>
                                                            {formatTimeDisplay(slot.time)}
                                                        </Text>
                                                        {!slot.available && (
                                                            <Ionicons name="lock-closed" size={14} color="#999" />
                                                        )}
                                                    </TouchableOpacity>
                                                ))}
                                        </View>
                                    </>
                                ) : (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>No hay horarios disponibles</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Botón de confirmación */}
                        {selectedDate && selectedTime && (
                            <TouchableOpacity
                                testID="confirm-appointment-button"
                                style={[styles.confirmButton, isBooking && styles.confirmButtonDisabled]}
                                onPress={() => {
                                    console.log('🟢 BOTÓN PRESIONADO - Confirmar Cita');
                                    handleConfirmAppointment();
                                }}
                                disabled={isBooking}
                                activeOpacity={0.7}
                            >
                                {isBooking ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                        <Text style={styles.confirmButtonText}>Confirmar Cita</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>

        {/* Modal de Confirmación */}
        {selectedDate && selectedTime && (
            <Modal
                animationType="fade"
                transparent={true}
                visible={showConfirmModal}
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.confirmModalOverlay}>
                    <View style={styles.confirmModalContent}>
                        <View style={styles.confirmIconContainer}>
                            <Ionicons name="calendar-outline" size={48} color="#4CAF50" />
                        </View>
                        
                        <Text style={styles.confirmTitle}>Confirmar Cita</Text>
                        
                        <View style={styles.confirmDetailsContainer}>
                            <View style={styles.confirmDetailRow}>
                                <Ionicons name="business" size={20} color="#666" />
                                <Text style={styles.confirmDetailText}>{provider.name}</Text>
                            </View>
                            
                            <View style={styles.confirmDetailRow}>
                                <Ionicons name="calendar" size={20} color="#666" />
                                <Text style={styles.confirmDetailText}>{formatDate(selectedDate)}</Text>
                            </View>
                            
                            <View style={styles.confirmDetailRow}>
                                <Ionicons name="time" size={20} color="#666" />
                                <Text style={styles.confirmDetailText}>{formatTimeDisplay(selectedTime)}</Text>
                            </View>
                        </View>

                        <Text style={styles.confirmMessage}>
                            ¿Deseas confirmar esta cita?
                        </Text>

                        <View style={styles.confirmButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.confirmModalButton, styles.cancelButton]}
                                onPress={() => setShowConfirmModal(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmModalButton, styles.confirmButtonGreen]}
                                onPress={handleCreateAppointment}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.confirmButtonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )}
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "95%",
        paddingBottom: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E8E8E8",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    closeButton: {
        padding: 4,
    },
    providerInfo: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F0F9FF",
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
    },
    providerText: {
        marginLeft: 12,
        flex: 1,
    },
    providerName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    providerCategory: {
        fontSize: 14,
        color: "#4CAF50",
        fontWeight: "600",
        marginTop: 2,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    dateSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 16,
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
    },
    timeBlockTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginTop: 16,
        marginBottom: 12,
    },
    timeSlotsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    timeSlot: {
        width: "30%",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#E8E8E8",
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    timeSlotSelected: {
        backgroundColor: "#4CAF50",
        borderColor: "#4CAF50",
    },
    timeSlotOccupied: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E8E8E8",
        opacity: 0.6,
    },
    timeSlotText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    timeSlotTextSelected: {
        color: "#fff",
    },
    timeSlotTextOccupied: {
        color: "#999",
        textDecorationLine: "line-through",
    },
    loadingContainer: {
        padding: 40,
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#666",
    },
    confirmButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4CAF50",
        marginHorizontal: 20,
        marginTop: 20,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    confirmButtonDisabled: {
        backgroundColor: "#A5D6A7",
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    // Estilos del Modal de Confirmación
    confirmModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    confirmModalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },
    confirmIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#E8F5E9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    confirmTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1A1A1A",
        marginBottom: 20,
    },
    confirmDetailsContainer: {
        width: "100%",
        backgroundColor: "#F8F9FD",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    confirmDetailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    confirmDetailText: {
        fontSize: 15,
        color: "#1A1A1A",
        marginLeft: 12,
        flex: 1,
    },
    confirmMessage: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
    },
    confirmButtonsContainer: {
        flexDirection: "row",
        width: "100%",
        gap: 12,
    },
    confirmModalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#666",
    },
    confirmButtonGreen: {
        backgroundColor: "#4CAF50",
        flexDirection: "row",
        gap: 6,
    },
});