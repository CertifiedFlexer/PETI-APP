import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AppointmentModal from "../components/AppointmentModal";

interface Provider {
    id: string;
    image: string;
    name: string;
    category: string;
    description: string;
    rating: number;
    phone: string;
    address: string;
}

const PROVIDERS: Provider[] = [
    {
        id: "1",
        image: "https://picsum.photos/400/250?random=101",
        name: "PetShop Central",
        category: "Tienda",
        description: "Amplio surtido de alimentos, accesorios y juguetes para tu mascota. Contamos con las mejores marcas del mercado.",
        rating: 4.8,
        phone: "+57 300 123 4567",
        address: "Calle 45 #23-12, Medellín",
    },
    {
        id: "2",
        image: "https://picsum.photos/400/250?random=102",
        name: "Mascotas Felices",
        category: "Tienda",
        description: "Especialistas en nutrición animal. Ofrecemos asesoría personalizada para el cuidado de tu mascota.",
        rating: 4.5,
        phone: "+57 301 234 5678",
        address: "Carrera 70 #45-89, Medellín",
    },
    {
        id: "3",
        image: "https://picsum.photos/400/250?random=103",
        name: "El Mundo de las Mascotas",
        category: "Tienda",
        description: "Todo lo que necesitas para el bienestar de tu mejor amigo. Productos premium y precios accesibles.",
        rating: 4.7,
        phone: "+57 302 345 6789",
        address: "Avenida 33 #67-45, Medellín",
    },
];

export default function StoresScreen({ navigation }: any) {
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);

    const openDetail = (provider: Provider) => {
        setSelectedProvider(provider);
        setModalVisible(true);
    };

    const closeDetail = () => {
        setModalVisible(false);
        setTimeout(() => setSelectedProvider(null), 300);
    };

    const openAppointmentModal = () => {
        setModalVisible(false);
        setTimeout(() => setAppointmentModalVisible(true), 300);
    };

    const closeAppointmentModal = () => {
        setAppointmentModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tiendas</Text>
                <View style={styles.placeholder} />
            </View>

            {/* List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {PROVIDERS.map((provider) => (
                    <TouchableOpacity
                        key={provider.id}
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() => openDetail(provider)}
                    >
                        <Image source={{ uri: provider.image }} style={styles.cardImage} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardName}>{provider.name}</Text>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={16} color="#FFB800" />
                                    <Text style={styles.ratingText}>{provider.rating}</Text>
                                </View>
                            </View>
                            <Text style={styles.cardCategory}>{provider.category}</Text>
                            <Text style={styles.cardDescription} numberOfLines={2}>
                                {provider.description}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Modal de Detalle */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeDetail}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeDetail}>
                            <Ionicons name="close-circle" size={32} color="#666" />
                        </TouchableOpacity>

                        {selectedProvider && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Image
                                    source={{ uri: selectedProvider.image }}
                                    style={styles.modalImage}
                                />
                                <View style={styles.modalBody}>
                                    <Text style={styles.modalName}>{selectedProvider.name}</Text>
                                    <Text style={styles.modalCategory}>{selectedProvider.category}</Text>

                                    <View style={styles.modalRating}>
                                        <Ionicons name="star" size={20} color="#FFB800" />
                                        <Text style={styles.modalRatingText}>{selectedProvider.rating}</Text>
                                        <Text style={styles.modalRatingSubtext}>(150+ reseñas)</Text>
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Descripción</Text>
                                        <Text style={styles.sectionText}>{selectedProvider.description}</Text>
                                    </View>

                                    <View style={styles.section}>
                                        <View style={styles.infoRow}>
                                            <Ionicons name="call" size={20} color="#2196F3" />
                                            <Text style={styles.infoText}>{selectedProvider.phone}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.section}>
                                        <View style={styles.infoRow}>
                                            <Ionicons name="location" size={20} color="#2196F3" />
                                            <Text style={styles.infoText}>{selectedProvider.address}</Text>
                                        </View>
                                    </View>

                                    {/* Botón Agendar Cita */}
                                    <TouchableOpacity
                                        style={styles.appointmentButton}
                                        onPress={openAppointmentModal}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="calendar" size={22} color="#fff" />
                                        <Text style={styles.appointmentButtonText}>Agendar Cita</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Agendar Cita */}
            {selectedProvider && (
                <AppointmentModal
                    visible={appointmentModalVisible}
                    onClose={closeAppointmentModal}
                    provider={{
                        id: selectedProvider.id,
                        name: selectedProvider.name,
                        category: selectedProvider.category
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FD",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E8E8E8",
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        overflow: "hidden",
    },
    cardImage: {
        width: "100%",
        height: 180,
        backgroundColor: "#E8E8E8",
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    cardName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
        flex: 1,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF8E1",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
        marginLeft: 4,
    },
    cardCategory: {
        fontSize: 14,
        color: "#2196F3",
        fontWeight: "600",
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
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
        maxHeight: "90%",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 },
        elevation: 10,
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: "#fff",
        borderRadius: 20,
    },
    modalImage: {
        width: "100%",
        height: 250,
        backgroundColor: "#E8E8E8",
    },
    modalBody: {
        padding: 24,
    },
    modalName: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    modalCategory: {
        fontSize: 16,
        color: "#2196F3",
        fontWeight: "600",
        marginBottom: 12,
    },
    modalRating: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    modalRatingText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
        marginLeft: 6,
    },
    modalRatingSubtext: {
        fontSize: 14,
        color: "#666",
        marginLeft: 8,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 15,
        color: "#666",
        lineHeight: 22,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoText: {
        fontSize: 15,
        color: "#1A1A1A",
        marginLeft: 12,
        flex: 1,
    },
    appointmentButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4CAF50",
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
        shadowColor: "#4CAF50",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    appointmentButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
});