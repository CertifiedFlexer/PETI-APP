import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { getUserStores, Store } from "../api/stores";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MyStoresScreen({ navigation }: any) {
    const { user, token } = useAuth();
    const { showError, showInfo } = useToast();
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStores = async () => {
        if (!user?.userId || !token) {
            setLoading(false);
            return;
        }

        try {
            const data = await getUserStores(user.userId, token);
            setStores(data);
            
            if (data.length === 0) {
                showInfo("No tienes tiendas registradas aún");
            }
        } catch (error: any) {
            console.error('Error:', error);
            
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                showError("Error de conexión. Verifica tu internet");
            } else {
                showError("Error al cargar tus tiendas");
            }
            setStores([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Recargar tiendas al volver a la pantalla
        const unsubscribe = navigation.addListener('focus', () => {
            fetchStores();
        });

        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStores();
    }, []);

    const handleStorePress = (store: Store) => {
        navigation.navigate("StoreDetail", { store });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#39C7fD" />
                <Text style={styles.loadingText}>Cargando tus tiendas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mis Tiendas</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate("RegisterProveedor")} 
                    style={styles.addButton}
                >
                    <Ionicons name="add-circle" size={28} color="#39C7fD" />
                </TouchableOpacity>
            </View>

            {stores.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                    <Ionicons name="storefront-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyStateTitle}>No tienes tiendas registradas</Text>
                    <Text style={styles.emptyStateText}>
                        Registra tu primera tienda para comenzar a recibir citas
                    </Text>
                    <TouchableOpacity 
                        style={styles.registerButton}
                        onPress={() => navigation.navigate("RegisterProveedor")}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.registerButtonText}>Registrar Tienda</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {stores.map((store) => (
                        <TouchableOpacity
                            key={store.id_proveedor}
                            style={styles.card}
                            activeOpacity={0.9}
                            onPress={() => handleStorePress(store)}
                        >
                            <Image 
                                source={{ uri: store.image_url || 'https://via.placeholder.com/400x250' }} 
                                style={styles.cardImage}
                            />
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardTitleContainer}>
                                        <Text style={styles.cardName}>{store.nombre_negocio}</Text>
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryText}>{store.tipo_servicio}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.ratingContainer}>
                                        <Ionicons name="star" size={16} color="#FFB800" />
                                        <Text style={styles.ratingText}>{store.puntuacion.toFixed(1)}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.infoRow}>
                                    <Ionicons name="call-outline" size={16} color="#666" />
                                    <Text style={styles.infoText}>{store.telefono}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Ionicons name="mail-outline" size={16} color="#666" />
                                    <Text style={styles.infoText}>{store.email}</Text>
                                </View>

                                {store.direccion && (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="location-outline" size={16} color="#666" />
                                        <Text style={styles.infoText} numberOfLines={1}>
                                            {store.direccion}
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity style={styles.viewButton}>
                                    <Text style={styles.viewButtonText}>Ver detalles</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#39C7fD" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FD",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F8F9FD",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
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
    addButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 20,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#39C7fD',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
        alignItems: "flex-start",
        marginBottom: 12,
    },
    cardTitleContainer: {
        flex: 1,
        marginRight: 12,
    },
    cardName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 6,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: "#E3F2FD",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 12,
        color: "#2196F3",
        fontWeight: "600",
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 8,
    },
    viewButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#39C7fD',
        marginRight: 4,
    },
});