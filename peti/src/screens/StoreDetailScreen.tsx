// StoreDetailScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
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
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [editedStore, setEditedStore] = useState<Store>(store);

    const fetchAppointments = async (date?: string) => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const dateToFetch = date || selectedDate;
            const data = await getProviderAppointments(store.id_proveedor, dateToFetch, token);
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            showError("Error al cargar las citas");
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
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() - 1);
        setSelectedDate(currentDate.toISOString().split('T')[0]);
        setLoading(true);
    };

    const handleNextDay = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + 1);
        setSelectedDate(currentDate.toISOString().split('T')[0]);
        setLoading(true);
    };

    const handleToday = () => {
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate !== today) {
            setSelectedDate(today);
            setLoading(true);
        }
    };

    const formatDisplayDate = (dateString: string): string => {
        try {
            const date = new Date(dateString + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const dateToCompare = new Date(date);
            dateToCompare.setHours(0, 0, 0, 0);

            if (dateToCompare.getTime() === today.getTime()) {
                return 'Hoy';
            }

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (dateToCompare.getTime() === tomorrow.getTime()) {
                return 'Mañana';
            }

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (dateToCompare.getTime() === yesterday.getTime()) {
                return 'Ayer';
            }

            return date.toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
        } catch (error) {
            return dateString;
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedStore(store);
        }
        setIsEditing(!isEditing);
    };

    const handleSaveChanges = async () => {
        if (!token) return;

        if (!editedStore.nombre_negocio.trim()) {
            showWarning("El nombre del negocio es requerido");
            return;
        }

        if (!editedStore.telefono.trim()) {
            showWarning("El teléfono es requerido");
            return;
        }

        if (!editedStore.email.trim()) {
            showWarning("El email es requerido");
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
                store.id_proveedor,
                {
                    nombre_negocio: editedStore.nombre_negocio,
                    tipo_servicio: editedStore.tipo_servicio,
                    telefono: editedStore.telefono,
                    email: editedStore.email,
                    descripcion: editedStore.descripcion,
                    direccion: editedStore.direccion,
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
            const updatedStore = await updateStoreImage(store.id_proveedor, imageUri, token);
            
            setStore(updatedStore);
            setEditedStore(updatedStore);
            showSuccess("Imagen actualizada correctamente");
        } catch (error: any) {
            console.error('Error uploading image:', error);
            
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                showError("Error de conexión. Verifica tu internet");
            } else {
                showError(error.message || "Error al subir la imagen");
            }
        } finally {
            setIsUploadingImage(false);
        }
    };

    const renderAppointmentCard = (appointment: Appointment) => (
        <View key={appointment.id} style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
                <View style={styles.appointmentUserInfo}>
                    <Ionicons name="person-circle" size={40} color="#39C7fD" />
                    <View style={styles.appointmentUserText}>
                        <Text style={styles.appointmentUserName}>{appointment.userName}</Text>
                        <Text style={styles.appointmentTime}>
                            {appointment.time} • {appointment.duration} min
                        </Text>
                    </View>
                </View>
                <View style={[
                    styles.statusBadge,
                    appointment.status === 'confirmed' && styles.statusConfirmed,
                    appointment.status === 'pending' && styles.statusPending,
                    appointment.status === 'cancelled' && styles.statusCancelled,
                ]}>
                    <Text style={[
                        styles.statusText,
                        appointment.status === 'confirmed' && { color: '#2E7D32' },
                        appointment.status === 'pending' && { color: '#F57C00' },
                        appointment.status === 'cancelled' && { color: '#C62828' },
                    ]}>
                        {appointment.status === 'confirmed' ? 'Confirmada' :
                         appointment.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalles</Text>
                <TouchableOpacity onPress={handleEditToggle} style={styles.editButton}>
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
                                <TextInput
                                    style={styles.input}
                                    value={editedStore.tipo_servicio}
                                    onChangeText={(text) => setEditedStore({...editedStore, tipo_servicio: text})}
                                    placeholder="Tipo de servicio"
                                />
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
                                style={styles.dateNavButton} 
                                onPress={handlePreviousDay}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="chevron-back" size={24} color="#39C7fD" />
                            </TouchableOpacity>

                            <View style={styles.dateDisplay}>
                                <Text style={styles.dateDisplayText}>
                                    {formatDisplayDate(selectedDate)}
                                </Text>
                                <Text style={styles.dateDisplaySubtext}>
                                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </Text>
                            </View>

                            <TouchableOpacity 
                                style={styles.dateNavButton} 
                                onPress={handleNextDay}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="chevron-forward" size={24} color="#39C7fD" />
                            </TouchableOpacity>
                        </View>

                        {selectedDate !== new Date().toISOString().split('T')[0] && (
                            <TouchableOpacity 
                                style={styles.todayButton}
                                onPress={handleToday}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="today" size={16} color="#39C7fD" />
                                <Text style={styles.todayButtonText}>Ir a hoy</Text>
                            </TouchableOpacity>
                        )}

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#39C7fD" />
                                <Text style={styles.loadingText}>Cargando citas...</Text>
                            </View>
                        ) : appointments.length === 0 ? (
                            <View style={styles.emptyAppointments}>
                                <Ionicons name="calendar-outline" size={48} color="#ccc" />
                                <Text style={styles.emptyAppointmentsText}>
                                    No hay citas para esta fecha
                                </Text>
                            </View>
                        ) : (
                            appointments.map(renderAppointmentCard)
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FD" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E8E8E8" },
    backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A" },
    editButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    imageContainer: { position: 'relative' },
    storeImage: { width: "100%", height: 250, backgroundColor: "#E8E8E8" },
    imageEditOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center' },
    imageEditText: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 8 },
    content: { padding: 20 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 16 },
    appointmentsBadge: { backgroundColor: '#39C7fD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, minWidth: 30, alignItems: 'center' },
    appointmentsBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    dateNavigator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E8E8E8' },
    dateNavButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#F8F9FD' },
    dateDisplay: { flex: 1, alignItems: 'center', paddingHorizontal: 16 },
    dateDisplayText: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 4, textTransform: 'capitalize' },
    dateDisplaySubtext: { fontSize: 13, color: '#666', textTransform: 'capitalize' },
    todayButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5FD', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 16, gap: 6 },
    todayButtonText: { fontSize: 14, fontWeight: '600', color: '#39C7fD' },
    field: { marginBottom: 16 },
    label: { fontSize: 14, color: "#666", marginBottom: 8, fontWeight: "600" },
    value: { fontSize: 16, color: "#1A1A1A", lineHeight: 22 },
    input: { height: 48, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: "#E0E0E0", fontSize: 16, color: "#111" },
    textArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
    saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#39C7fD', paddingVertical: 14, borderRadius: 12, marginBottom: 24, gap: 8 },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    loadingContainer: { padding: 20, alignItems: 'center' },
    loadingText: { marginTop: 8, fontSize: 14, color: '#666' },
    emptyAppointments: { padding: 40, alignItems: 'center' },
    emptyAppointmentsText: { fontSize: 14, color: '#999', marginTop: 12, textAlign: 'center' },
    appointmentCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E8E8E8' },
    appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    appointmentUserInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    appointmentUserText: { marginLeft: 12, flex: 1 },
    appointmentUserName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
    appointmentTime: { fontSize: 14, color: '#666' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusConfirmed: { backgroundColor: '#E8F5E9' },
    statusPending: { backgroundColor: '#FFF3E0' },
    statusCancelled: { backgroundColor: '#FFEBEE' },
    statusText: { fontSize: 12, fontWeight: '600' },
});