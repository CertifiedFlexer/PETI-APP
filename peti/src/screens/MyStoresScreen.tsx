// MyStoresScreen.tsx
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
import { PromotedBadge } from "../components/PromotedBadge";
import { PromotionModal } from "../components/PromotionModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

let getPromotionStatus: any = null;
try {
    const paymentsModule = require("../api/payments");
    getPromotionStatus = paymentsModule.getPromotionStatus;
} catch (error) {
    console.warn("⚠️ Módulo de payments no disponible, las promociones estarán deshabilitadas");
}

interface PromotionStatus {
    is_promoted: boolean;
    days_remaining?: number;
}

interface StoreWithPromotion extends Store {
    promotion?: PromotionStatus;
}

export default function MyStoresScreen({ navigation }: any) {
    const { user, token } = useAuth();
    const { showError, showInfo } = useToast();
    
    const [stores, setStores] = useState<StoreWithPromotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const [promotionModalVisible, setPromotionModalVisible] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    const fetchStores = async () => {
        console.log('🔄 MyStoresScreen - fetchStores iniciando...');
        console.log('👤 User ID:', user?.userId);
        console.log('🔑 Token:', token ? 'Presente ✓' : 'Ausente ✗');

        if (!user?.userId || !token) {
            console.log('⚠️ Faltan credenciales, abortando carga');
            setLoading(false);
            return;
        }

        try {
            console.log('📡 Llamando a getUserStores...');
            const data = await getUserStores(user.userId, token);
            
            console.log(`✅ Tiendas recibidas del backend: ${data.length}`);
            console.log('📦 Datos:', JSON.stringify(data, null, 2));
            
            if (getPromotionStatus && data.length > 0) {
                console.log('⭐ Cargando estados de promoción...');
                const storesWithPromotion = await Promise.all(
                    data.map(async (store) => {
                        try {
                            const promotion = await getPromotionStatus(store.id_proveedor, token);
                            console.log(`  ✓ Promoción cargada para ${store.nombre_negocio}`);
                            return { ...store, promotion };
                        } catch (error) {
                            console.log(`  ⚠️ Error cargando promoción para ${store.nombre_negocio}:`, error);
                            return store;
                        }
                    })
                );
                setStores(storesWithPromotion);
            } else {
                console.log('ℹ️ Promociones no disponibles, mostrando tiendas sin promoción');
                setStores(data);
            }
            
            if (data.length === 0) {
                console.log('ℹ️ No hay tiendas para este usuario');
                showInfo("No tienes tiendas registradas aún");
            } else {
                console.log(`✅ ${data.length} tiendas cargadas exitosamente`);
            }
        } catch (error: any) {
            console.error('❌ ERROR en fetchStores:', error);
            console.error('📝 Error message:', error.message);
            console.error('📝 Error stack:', error.stack);
            
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                showError("Error de conexión. Verifica tu internet");
            } else {
                showError(error.message || "Error al cargar tus tiendas");
            }
            setStores([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        console.log('🎬 MyStoresScreen montado');
        fetchStores();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('👁️ Pantalla enfocada, recargando...');
            fetchStores();
        });

        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        console.log('🔄 Pull to refresh');
        setRefreshing(true);
        fetchStores();
    }, []);

    const handleStorePress = (store: Store) => {
        console.log('🏪 Navegando a detalle:', store.nombre_negocio);
        navigation.navigate("StoreDetail", { store });
    };

    const handlePromotePress = (store: Store) => {
        console.log('⭐ Abriendo modal de promoción para:', store.nombre_negocio);
        setSelectedStore(store);
        setPromotionModalVisible(true);
    };

    const handlePromotionSuccess = () => {
        console.log('✅ Promoción exitosa, recargando tiendas...');
        fetchStores();
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
                        <View key={store.id_proveedor} style={styles.card}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => handleStorePress(store)}
                            >
                                <View style={styles.imageContainer}>
                                    <Image 
                                        source={{ uri: store.image_url || 'https://via.placeholder.com/400x250' }} 
                                        style={styles.cardImage}
                                    />
                                    {store.promotion?.is_promoted && (
                                        <View style={styles.promotedBadgeContainer}>
                                            <PromotedBadge variant="small" />
                                        </View>
                                    )}
                                </View>
                                
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

                                    {store.promotion?.is_promoted ? (
                                        <View style={styles.promotionInfo}>
                                            <Ionicons name="star" size={16} color="#FFD700" />
                                            <Text style={styles.promotionInfoText}>
                                                Promocionada • {store.promotion.days_remaining} días restantes
                                            </Text>
                                        </View>
                                    ) : getPromotionStatus ? (
                                        <TouchableOpacity 
                                            style={styles.promoteButton}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handlePromotePress(store);
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="rocket" size={18} color="#fff" />
                                            <Text style={styles.promoteButtonText}>Promover Tienda</Text>
                                        </TouchableOpacity>
                                    ) : null}

                                    <View style={styles.viewButton}>
                                        <Text style={styles.viewButtonText}>Ver detalles</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#39C7fD" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}

            {selectedStore && getPromotionStatus && (
                <PromotionModal
                    visible={promotionModalVisible}
                    onClose={() => {
                        setPromotionModalVisible(false);
                        setSelectedStore(null);
                    }}
                    providerId={selectedStore.id_proveedor}
                    providerName={selectedStore.nombre_negocio}
                    onSuccess={handlePromotionSuccess}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
    loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E8E8E8" },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", flex: 1, textAlign: "center" },
    addButton: { padding: 8 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyStateTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginTop: 20, textAlign: 'center' },
    emptyStateText: { fontSize: 15, color: '#666', marginTop: 8, textAlign: 'center', lineHeight: 22 },
    registerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#39C7fD', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, marginTop: 24, gap: 8 },
    registerButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    card: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3, overflow: "hidden" },
    imageContainer: { position: 'relative', width: '100%', height: 180, backgroundColor: '#E8E8E8' },
    cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    promotedBadgeContainer: { position: 'absolute', top: 12, right: 12 },
    cardContent: { padding: 16 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    cardTitleContainer: { flex: 1, marginRight: 12 },
    cardName: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 6 },
    categoryBadge: { alignSelf: 'flex-start', backgroundColor: "#E3F2FD", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    categoryText: { fontSize: 12, color: "#2196F3", fontWeight: "600" },
    ratingContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF8E1", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    ratingText: { fontSize: 14, fontWeight: "600", color: "#1A1A1A", marginLeft: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoText: { fontSize: 14, color: '#666', marginLeft: 8, flex: 1 },
    promotionInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginTop: 8, gap: 8 },
    promotionInfoText: { fontSize: 13, color: '#B8860B', fontWeight: '600', flex: 1 },
    promoteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFD700', paddingVertical: 10, borderRadius: 10, marginTop: 8, gap: 6, shadowColor: '#FFD700', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    promoteButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
    viewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingVertical: 8 },
    viewButtonText: { fontSize: 15, fontWeight: '600', color: '#39C7fD', marginRight: 4 },
});