import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator
} from "react-native";
import AppointmentModal from "../components/AppointmentModal";

interface Provider {
    id_proveedor: string;
    nombre_negocio: string;
    tipo_servicio: string;
    telefono: string;
    email: string;
    descripcion: string;
    image: string;
    puntuacion: number;
    direccion: string ;
}

// const PROVIDERS: Provider[] = [
//     {
//         id: "1",
//         image: "https://picsum.photos/400/250?random=401",
//         name: "Paseos Felices",
//         category: "Paseador",
//         description: "Servicio profesional de paseo para perros. Atención personalizada con horarios flexibles y rutas seguras por la ciudad.",
//         rating: 4.9,
//         phone: "+57 310 777 8888",
//         address: "Poblado, Medellín",
//     },
//     {
//         id: "2",
//         image: "https://picsum.photos/400/250?random=402",
//         name: "Dog Walker Pro",
//         category: "Paseador",
//         description: "Paseadores certificados con experiencia en manejo de diferentes razas. Incluye reporte fotográfico de cada paseo.",
//         rating: 4.7,
//         phone: "+57 311 888 9999",
//         address: "Laureles, Medellín",
//     },
//     {
//         id: "3",
//         image: "https://picsum.photos/400/250?random=403",
//         name: "Aventura Canina",
//         category: "Paseador",
//         description: "Paseos individuales y grupales. Socializamos a tu mascota mientras disfruta de ejercicio al aire libre.",
//         rating: 4.8,
//         phone: "+57 312 999 0000",
//         address: "Envigado, Antioquia",
//     },
// ];

export default function WalkersScreen({ navigation }: any) {
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/providers/service/Paseador")
                const json = await response.json();
                setData(json as any[]);
            } catch (error) {
                console.log("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <ActivityIndicator />;

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

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Paseadores</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {data.map((provider) => (
                    <TouchableOpacity
                        key={provider.provider_id}
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() => openDetail(provider)}
                    >
                        <Image source={{ uri: provider.image }} style={styles.cardImage} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardName}>{provider.nombre_negocio}</Text>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={16} color="#FFB800" />
                                    <Text style={styles.ratingText}>{provider.puntuacion}</Text>
                                </View>
                            </View>
                            <Text style={styles.cardCategory}>{provider.tipo_servicio}</Text>
                            <Text style={styles.cardDescription} numberOfLines={2}>
                                {provider.descripcion}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

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
                                    <Text style={styles.modalName}>{selectedProvider.nombre_negocio}</Text>
                                    <Text style={styles.modalCategory}>{selectedProvider.tipo_servicio}</Text>

                                    <View style={styles.modalRating}>
                                        <Ionicons name="star" size={20} color="#FFB800" />
                                        <Text style={styles.modalRatingText}>{selectedProvider.puntuacion}</Text>
                                        <Text style={styles.modalRatingSubtext}>(120+ reseñas)</Text>
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Descripción</Text>
                                        <Text style={styles.sectionText}>{selectedProvider.descripcion}</Text>
                                    </View>

                                    <View style={styles.section}>
                                        <View style={styles.infoRow}>
                                            <Ionicons name="call" size={20} color="#2196F3" />
                                            <Text style={styles.infoText}>{selectedProvider.telefono}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.section}>
                                        <View style={styles.infoRow}>
                                            <Ionicons name="location" size={20} color="#2196F3" />
                                            <Text style={styles.infoText}>{selectedProvider.direccion || "No disponible"}</Text>
                                        </View>
                                    </View>

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

            {selectedProvider && (
                <AppointmentModal
                    visible={appointmentModalVisible}
                    onClose={closeAppointmentModal}
                    provider={{
                        id: selectedProvider.id_proveedor,
                        name: selectedProvider.nombre_negocio,
                        category: selectedProvider.tipo_servicio
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
        backgroundColor: "#3AC7FD",
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
        shadowColor: "#3AC7FD",
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