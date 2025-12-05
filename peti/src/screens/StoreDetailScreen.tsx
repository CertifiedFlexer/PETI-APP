import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { getProviderAppointments } from "../api/appointments";
import { Store, updateStore, updateStoreImage } from "../api/stores";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Appointment } from "../types/appointments.types";

const SERVICE_TYPES = [
    "Veterinaria",
    "Tienda",
    "Peluquería",
    "Paseador",
    "Seguro",
] as const;

type ServiceType = typeof SERVICE_TYPES[number];

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada'
};

// Utilidad para manejar fechas sin problemas de zona horaria
const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getTodayString = (): string => {
    return getLocalDateString(new Date());
};

export default function StoreDetailScreen({ route, navigation }: any) {
    const { store: initialStore } = route.params as { store: Store };
    const { token } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();

    const [store, setStore] = useState<Store>(initialStore);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
    const [editedStore, setEditedStore] = useState<Store>(store);
    const [showServiceModal, setShowServiceModal] = useState(false);

    const fetchAppointments = async (date?: string) => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const dateToFetch = date || selectedDate;
            console.log('📅 Fetching appointments for:', dateToFetch);
            
            const data = await getProviderAppointments(store.id_proveedor, dateToFetch, token);
            
            // Filtro adicional en el frontend como medida de seguridad
            const filteredData = data.filter(apt => {
                const aptDate = apt.date.split('T')[0]; // Normalizar formato
                return aptDate === dateToFetch;
            });
            
            console.log('✅ Appointments found:', filteredData.length);
            setAppointments(filteredData);
        } catch (error) {
            console.error('❌ Error fetching appointments:', error);
            showError("Error al cargar las citas");
            setAppointments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAppointments();
    }, [selectedDate]);

    const handlePreviousDay = () => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const currentDate = new Date(year, month - 1, day);
        currentDate.setDate(currentDate.getDate() - 1);
        
        const newDate = getLocalDateString(currentDate);
        console.log('◀️ Previous day:', newDate);
        setSelectedDate(newDate);
        setLoading(true);
    };

    const handleNextDay = () => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const currentDate = new Date(year, month - 1, day);
        currentDate.setDate(currentDate.getDate() + 1);
        
        const newDate = getLocalDateString(currentDate);
        console.log('▶️ Next day:', newDate);
        setSelectedDate(newDate);
        setLoading(true);
    };

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleServiceSelect = (service: ServiceType) => {
        setEditedStore({...editedStore, tipo_servicio: service});
        setShowServiceModal(false);
    };

    const handleSaveChanges = async () => {
        if (!token) {
            showError("Sesión expirada");
            return;
        }

        if (!editedStore.nombre_negocio.trim()) {
            showWarning("El nombre del negocio es obligatorio");
            return;
        }

        if (!editedStore.tipo_servicio.trim()) {
            showWarning("El tipo de servicio es obligatorio");
            return;
        }

        if (!editedStore.telefono.trim()) {
            showWarning("El teléfono es obligatorio");
            return;
        }

        if (!editedStore.email.trim()) {
            showWarning("El email es obligatorio");
            return;
        }

        const phoneRegex = /^\d{7,15}$/;
        if (!phoneRegex.test(editedStore.telefono)) {
            showError("El teléfono debe contener solo números (7-15 dígitos)");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editedStore.email)) {
            showError("El formato del email es inválido");
            return;
        }

        setIsSaving(true);
        try {
            const updated = await updateStore(
                {
                    nombre_negocio: editedStore.nombre_negocio,
                    tipo_servicio: editedStore.tipo_servicio,
                    telefono: editedStore.telefono,
                    email: editedStore.email,
                    descripcion: editedStore.descripcion,
                    direccion: editedStore.direccion,
                    id_proveedor: store.id_proveedor
                },
                token
            );

            setStore(updated);
            setEditedStore(updated);
            setIsEditing(false);
            showSuccess("Información actualizada correctamente");
        } catch (error: any) {
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                showError("Error de conexión. Verifica tu internet");
            } else {
                showError(error.message || "Error al actualizar la tienda");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!permissionResult.granted) {
            showWarning("Se necesitan permisos para acceder a la galería");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (imageUri: string) => {
        if (!token) return;

        setIsUploadingImage(true);
        try {
            const updatedStore = await updateStoreImage(store.id_proveedor, imageUri, token) as Store;
            
            setStore(updatedStore);
            setEditedStore(updatedStore);
            showSuccess("Imagen actualizada correctamente");
        } catch (error: any) {
            console.error('❌ Error uploading image:', error);
            
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                showError("Error de conexión. Verifica tu internet");
            } else {
                showError("Error al actualizar la imagen");
            }
        } finally {
            setIsUploadingImage(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>{store.nombre_negocio}</Text>
                
                <TouchableOpacity
                    onPress={() => {
                        if (isEditing) {
                            setEditedStore(store);
                            setIsEditing(false);
                        } else {
                            setIsEditing(true);
                        }
                    }}
                    style={styles.editButton}
                >
                    <Ionicons 
                        name={isEditing ? "close" : "create"} 
                        size={24} 
                        color={isEditing ? "#EF5350" : "#39C7fD"} 
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: store.image_url || 'https://via.placeholder.com/400x250' }} 
                        style={styles.storeImage}
                    />
                    {isEditing && (
                        <TouchableOpacity 
                            style={styles.imageEditOverlay}
                            onPress={handleImagePick}
                            disabled={isUploadingImage}
                        >
                            {isUploadingImage ? (
                                <ActivityIndicator color="#fff" size="large" />
                            ) : (
                                <>
                                    <Ionicons name="camera" size={40} color="#fff" />
                                    <Text style={styles.imageEditText}>Cambiar imagen</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información del Negocio</Text>
                        
                        <View style={styles.field}>
                            <Text style={styles.label}>Nombre del negocio</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.input}
                                    value={editedStore.nombre_negocio}
                                    onChangeText={(text) => setEditedStore({...editedStore, nombre_negocio: text})}
                                    placeholder="Nombre del negocio"
                                />
                            ) : (
                                <Text style={styles.value}>{store.nombre_negocio}</Text>
                            )}
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Tipo de servicio</Text>
                            {isEditing ? (
                                <TouchableOpacity
                                    style={[styles.input, styles.selectInput]}
                                    onPress={() => setShowServiceModal(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.selectText,
                                        !editedStore.tipo_servicio && styles.placeholderText
                                    ]}>
                                        {editedStore.tipo_servicio || "Selecciona un tipo de servicio"}
                                    </Text>
                                    <Ionicons 
                                        name="chevron-down" 
                                        size={20} 
                                        color={editedStore.tipo_servicio ? "#111" : "#999"} 
                                    />
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.value}>{store.tipo_servicio}</Text>
                            )}
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Teléfono</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.input}
                                    value={editedStore.telefono}
                                    onChangeText={(text) => setEditedStore({...editedStore, telefono: text})}
                                    placeholder="Teléfono"
                                    keyboardType="phone-pad"
                                />
                            ) : (
                                <Text style={styles.value}>{store.telefono}</Text>
                            )}
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Email</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.input}
                                    value={editedStore.email}
                                    onChangeText={(text) => setEditedStore({...editedStore, email: text})}
                                    placeholder="Email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            ) : (
                                <Text style={styles.value}>{store.email}</Text>
                            )}
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Dirección</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.input}
                                    value={editedStore.direccion || ''}
                                    onChangeText={(text) => setEditedStore({...editedStore, direccion: text})}
                                    placeholder="Dirección"
                                />
                            ) : (
                                <Text style={styles.value}>{store.direccion || 'No especificada'}</Text>
                            )}
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Descripción</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={editedStore.descripcion || ''}
                                    onChangeText={(text) => setEditedStore({...editedStore, descripcion: text})}
                                    placeholder="Descripción del negocio"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            ) : (
                                <Text style={styles.value}>{store.descripcion || 'Sin descripción'}</Text>
                            )}
                        </View>
                    </View>

                    {isEditing && (
                        <TouchableOpacity
                            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                            onPress={handleSaveChanges}
                            disabled={isSaving}
                            activeOpacity={0.8}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Citas Agendadas</Text>
                            <View style={styles.appointmentsBadge}>
                                <Text style={styles.appointmentsBadgeText}>{appointments.length}</Text>
                            </View>
                        </View>

                        <View style={styles.dateNavigator}>
                            <TouchableOpacity 
                                style={styles.dateArrow}
                                onPress={handlePreviousDay}
                            >
                                <Ionicons name="chevron-back" size={24} color="#39C7fD" />
                            </TouchableOpacity>
                            
                            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                            
                            <TouchableOpacity 
                                style={styles.dateArrow}
                                onPress={handleNextDay}
                            >
                                <Ionicons name="chevron-forward" size={24} color="#39C7fD" />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#39C7fD" />
                            </View>
                        ) : appointments.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={60} color="#ccc" />
                                <Text style={styles.emptyStateText}>No hay citas para esta fecha</Text>
                            </View>
                        ) : (
                            <View style={styles.appointmentsList}>
                                {appointments.map((appointment) => (
                                    <View key={appointment.id} style={styles.appointmentCard}>
                                        <View style={styles.appointmentHeader}>
                                            <View style={styles.appointmentTime}>
                                                <Ionicons name="time" size={18} color="#39C7fD" />
                                                <Text style={styles.appointmentTimeText}>
                                                    {appointment.time}
                                                </Text>
                                            </View>
                                            <View style={[
                                                styles.statusBadge,
                                                appointment.status === 'completed' && styles.statusCompleted,
                                                appointment.status === 'cancelled' && styles.statusCanceled,
                                                appointment.status === 'confirmed' && styles.statusConfirmed,
                                            ]}>
                                                <Text style={styles.statusText}>
                                                    {STATUS_LABELS[appointment.status]}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.appointmentUser}>{appointment.userName}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showServiceModal}
                onRequestClose={() => setShowServiceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tipo de Servicio</Text>
                            <TouchableOpacity
                                onPress={() => setShowServiceModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalList}>
                            {SERVICE_TYPES.map((service) => (
                                <TouchableOpacity
                                    key={service}
                                    style={[
                                        styles.serviceOption,
                                        editedStore.tipo_servicio === service && styles.serviceOptionSelected
                                    ]}
                                    onPress={() => handleServiceSelect(service)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.serviceOptionText,
                                        editedStore.tipo_servicio === service && styles.serviceOptionTextSelected
                                    ]}>
                                        {service}
                                    </Text>
                                    {editedStore.tipo_servicio === service && (
                                        <Ionicons name="checkmark-circle" size={24} color="#39C7fD" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E8E8E8",
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 12,
    },
    editButton: {
        padding: 8,
    },
    imageContainer: {
        position: "relative",
    },
    storeImage: {
        width: "100%",
        height: 250,
        resizeMode: "cover",
    },
    imageEditOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    imageEditText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 8,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 16,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    value: {
        fontSize: 16,
        color: "#1A1A1A",
        lineHeight: 24,
    },
    input: {
        backgroundColor: "#F8F9FD",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#E8E8E8",
    },
    selectInput: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectText: {
        fontSize: 16,
        color: "#111",
        flex: 1,
    },
    placeholderText: {
        color: "#999",
    },
    textArea: {
        height: 120,
        paddingTop: 14,
        textAlignVertical: "top",
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#39C7fD",
        borderRadius: 12,
        paddingVertical: 16,
        marginBottom: 28,
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    appointmentsBadge: {
        backgroundColor: "#39C7fD",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        minWidth: 32,
        alignItems: "center",
    },
    appointmentsBadgeText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    dateNavigator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: "#F8F9FD",
        borderRadius: 12,
        marginBottom: 20,
    },
    dateArrow: {
        padding: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
        textAlign: "center",
        flex: 1,
        textTransform: "capitalize",
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: "center",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#999",
        marginTop: 12,
    },
    appointmentsList: {
        gap: 12,
    },
    appointmentCard: {
        backgroundColor: "#F8F9FD",
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#39C7fD",
    },
    appointmentHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    appointmentTime: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    appointmentTimeText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: "#FFA726",
    },
    statusConfirmed: {
        backgroundColor: "#2196F3",
    },
    statusCompleted: {
        backgroundColor: "#66BB6A",
    },
    statusCanceled: {
        backgroundColor: "#EF5350",
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    appointmentUser: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
        maxHeight: "70%",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E8E8E8",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    modalCloseButton: {
        padding: 4,
    },
    modalList: {
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    serviceOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: "#F8F9FD",
        borderWidth: 2,
        borderColor: "transparent",
    },
    serviceOptionSelected: {
        backgroundColor: "#39C7fD15",
        borderColor: "#39C7fD",
    },
    serviceOptionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    serviceOptionTextSelected: {
        color: "#39C7fD",
        fontWeight: "700",
    },
});