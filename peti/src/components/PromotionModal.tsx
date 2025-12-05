import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { usePromotion } from "../hooks/usePromotion";
import { PromotionPlan, PSEBank } from "../types/payments.types";

interface PromotionModalProps {
    visible: boolean;
    onClose: () => void;
    providerId: string;
    providerName: string;
    onSuccess?: () => void;
}

type Step = 'plan' | 'bank' | 'payment' | 'processing' | 'success';
type UserType = 'natural' | 'juridica';
type IdentificationType = 'CC' | 'NIT' | 'CE' | 'TI';

/**
 * Modal completo para el flujo de promoción con pago PSE
 * 
 * Pasos:
 * 1. Selección de plan
 * 2. Selección de banco
 * 3. Datos de pago
 * 4. Procesamiento
 * 5. Confirmación
 */
export const PromotionModal: React.FC<PromotionModalProps> = ({
    visible,
    onClose,
    providerId,
    providerName,
    onSuccess,
}) => {
    const {
        plans,
        banks,
        selectedPlan,
        selectedBank,
        loading,
        processing,
        loadPlans,
        loadBanks,
        selectPlan,
        selectBank,
        initiatePayment,
        completePayment,
        reset,
    } = usePromotion();

    const [currentStep, setCurrentStep] = useState<Step>('plan');
    const [userType, setUserType] = useState<UserType>('natural');
    const [identificationType, setIdentificationType] = useState<IdentificationType>('CC');
    const [identificationNumber, setIdentificationNumber] = useState('');

    // Cargar datos al abrir modal
    useEffect(() => {
        if (visible) {
            loadPlans();
            setCurrentStep('plan');
        } else {
            // Reset al cerrar
            reset();
            setCurrentStep('plan');
            setUserType('natural');
            setIdentificationType('CC');
            setIdentificationNumber('');
        }
    }, [visible]);

    const handlePlanSelect = (plan: PromotionPlan) => {
        selectPlan(plan);
        loadBanks();
        setCurrentStep('bank');
    };

    const handleBankSelect = (bank: PSEBank) => {
        selectBank(bank);
        setCurrentStep('payment');
    };

    const handlePayment = async () => {
        setCurrentStep('processing');

        // Iniciar intención de pago
        const intent = await initiatePayment(providerId);
        if (!intent) {
            setCurrentStep('payment');
            return;
        }
        try {
            fetch(`https://peti-back.onrender.com/api/providers/${providerId}/subscription`, {
                method: 'PUT'})
        const result = await completePayment(
            identificationType,
            identificationNumber,
            userType
        );

        if (result) {
            setCurrentStep('success');
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2000);
        } else {
            setCurrentStep('payment');
        }
        } catch (error) {
            console.error('Error al actualizar la suscripción:', error);
        }

        
    };

    const handleBack = () => {
        if (currentStep === 'bank') setCurrentStep('plan');
        else if (currentStep === 'payment') setCurrentStep('bank');
    };

    const canProceedToPayment = identificationNumber.trim().length >= 6;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        {currentStep !== 'plan' && currentStep !== 'processing' && currentStep !== 'success' && (
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle}>
                            {currentStep === 'plan' && 'Selecciona un Plan'}
                            {currentStep === 'bank' && 'Selecciona tu Banco'}
                            {currentStep === 'payment' && 'Datos de Pago'}
                            {currentStep === 'processing' && 'Procesando...'}
                            {currentStep === 'success' && '¡Listo!'}
                        </Text>
                        {currentStep !== 'processing' && currentStep !== 'success' && (
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Provider Info */}
                    <View style={styles.providerInfo}>
                        <Ionicons name="storefront" size={24} color="#39C7fD" />
                        <Text style={styles.providerName}>{providerName}</Text>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* STEP 1: Plan Selection */}
                        {currentStep === 'plan' && (
                            <View style={styles.section}>
                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color="#39C7fD" />
                                        <Text style={styles.loadingText}>Cargando planes...</Text>
                                    </View>
                                ) : (
                                    plans.map((plan) => (
                                        <TouchableOpacity
                                            key={plan.id}
                                            style={[
                                                styles.planCard,
                                                plan.popular && styles.planCardPopular,
                                            ]}
                                            onPress={() => handlePlanSelect(plan)}
                                            activeOpacity={0.8}
                                        >
                                            {plan.popular && (
                                                <View style={styles.popularBadge}>
                                                    <Text style={styles.popularText}>MÁS POPULAR</Text>
                                                </View>
                                            )}
                                            <Text style={styles.planName}>{plan.name}</Text>
                                            <View style={styles.priceContainer}>
                                                <Text style={styles.planPrice}>
                                                    {plan.price === 0 ? 'GRATIS' : `$${plan.price.toLocaleString()}`}
                                                </Text>
                                                {plan.price === 0 && (
                                                    <Text style={styles.planSubtext}>(Versión de desarrollo)</Text>
                                                )}
                                            </View>
                                            <Text style={styles.planDuration}>{plan.duration_days} días</Text>
                                            <View style={styles.divider} />
                                            {plan.features.map((feature, index) => (
                                                <View key={index} style={styles.featureRow}>
                                                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                                    <Text style={styles.featureText}>{feature}</Text>
                                                </View>
                                            ))}
                                            <View style={styles.selectButton}>
                                                <Text style={styles.selectButtonText}>Seleccionar</Text>
                                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        )}

                        {/* STEP 2: Bank Selection */}
                        {currentStep === 'bank' && (
                            <View style={styles.section}>
                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color="#39C7fD" />
                                        <Text style={styles.loadingText}>Cargando bancos...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={styles.sectionTitle}>Bancos disponibles con PSE</Text>
                                        {banks.map((bank) => (
                                            <TouchableOpacity
                                                key={bank.id}
                                                style={styles.bankCard}
                                                onPress={() => handleBankSelect(bank)}
                                                activeOpacity={0.8}
                                            >
                                                <Ionicons name="business" size={24} color="#39C7fD" />
                                                <Text style={styles.bankName}>{bank.name}</Text>
                                                <Ionicons name="chevron-forward" size={24} color="#999" />
                                            </TouchableOpacity>
                                        ))}
                                    </>
                                )}
                            </View>
                        )}

                        {/* STEP 3: Payment Data */}
                        {currentStep === 'payment' && (
                            <View style={styles.section}>
                                <View style={styles.summaryCard}>
                                    <Text style={styles.summaryTitle}>Resumen de compra</Text>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Plan:</Text>
                                        <Text style={styles.summaryValue}>{selectedPlan?.name}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Banco:</Text>
                                        <Text style={styles.summaryValue}>{selectedBank?.name}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Duración:</Text>
                                        <Text style={styles.summaryValue}>{selectedPlan?.duration_days} días</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabelBold}>Total:</Text>
                                        <Text style={styles.summaryTotal}>
                                            {selectedPlan?.price === 0 
                                                ? 'GRATIS' 
                                                : `$${selectedPlan?.price.toLocaleString()}`
                                            }
                                        </Text>
                                    </View>
                                    {selectedPlan?.price === 0 && (
                                        <Text style={styles.devNote}>
                                            ⚠️ Modo de desarrollo: No se realizará cobro real
                                        </Text>
                                    )}
                                </View>

                                <Text style={styles.sectionTitle}>Tipo de persona</Text>
                                <View style={styles.radioGroup}>
                                    <TouchableOpacity
                                        style={[
                                            styles.radioOption,
                                            userType === 'natural' && styles.radioOptionSelected,
                                        ]}
                                        onPress={() => setUserType('natural')}
                                    >
                                        <View style={styles.radio}>
                                            {userType === 'natural' && <View style={styles.radioInner} />}
                                        </View>
                                        <Text style={styles.radioText}>Persona Natural</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.radioOption,
                                            userType === 'juridica' && styles.radioOptionSelected,
                                        ]}
                                        onPress={() => setUserType('juridica')}
                                    >
                                        <View style={styles.radio}>
                                            {userType === 'juridica' && <View style={styles.radioInner} />}
                                        </View>
                                        <Text style={styles.radioText}>Persona Jurídica</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.sectionTitle}>Tipo de identificación</Text>
                                <View style={styles.identificationRow}>
                                    {['CC', 'CE', 'TI', 'NIT'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.identificationButton,
                                                identificationType === type && styles.identificationButtonSelected,
                                            ]}
                                            onPress={() => setIdentificationType(type as IdentificationType)}
                                        >
                                            <Text
                                                style={[
                                                    styles.identificationText,
                                                    identificationType === type && styles.identificationTextSelected,
                                                ]}
                                            >
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.sectionTitle}>Número de identificación</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingresa tu número de identificación"
                                    value={identificationNumber}
                                    onChangeText={setIdentificationNumber}
                                    keyboardType="numeric"
                                    maxLength={15}
                                />

                                <TouchableOpacity
                                    style={[
                                        styles.payButton,
                                        !canProceedToPayment && styles.payButtonDisabled,
                                    ]}
                                    onPress={handlePayment}
                                    disabled={!canProceedToPayment}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="card" size={22} color="#fff" />
                                    <Text style={styles.payButtonText}>
                                        {selectedPlan?.price === 0 ? 'Activar Promoción' : 'Pagar con PSE'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* STEP 4: Processing */}
                        {currentStep === 'processing' && (
                            <View style={styles.statusContainer}>
                                <ActivityIndicator size="large" color="#39C7fD" />
                                <Text style={styles.statusTitle}>Procesando pago...</Text>
                                <Text style={styles.statusSubtext}>
                                    Esto puede tomar unos segundos
                                </Text>
                            </View>
                        )}

                        {/* STEP 5: Success */}
                        {currentStep === 'success' && (
                            <View style={styles.statusContainer}>
                                <View style={styles.successIcon}>
                                    <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                                </View>
                                <Text style={styles.statusTitle}>¡Promoción activada!</Text>
                                <Text style={styles.statusSubtext}>
                                    Tu tienda ahora aparecerá en los primeros resultados
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "95%",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 20,
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
        flex: 1,
        textAlign: "center",
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    providerInfo: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#F0F9FF",
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
        gap: 12,
    },
    providerName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 12,
        marginTop: 16,
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
    planCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: "#E8E8E8",
        position: "relative",
    },
    planCardPopular: {
        borderColor: "#FFD700",
        backgroundColor: "#FFFEF0",
    },
    popularBadge: {
        position: "absolute",
        top: -10,
        right: 20,
        backgroundColor: "#FFD700",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    planName: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    priceContainer: {
        marginBottom: 8,
    },
    planPrice: {
        fontSize: 32,
        fontWeight: "800",
        color: "#39C7fD",
    },
    planSubtext: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    planDuration: {
        fontSize: 14,
        color: "#666",
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: "#E8E8E8",
        marginVertical: 16,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    featureText: {
        fontSize: 14,
        color: "#1A1A1A",
        flex: 1,
    },
    selectButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#39C7fD",
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    selectButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    bankCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FD",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E8E8E8",
    },
    bankName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
        flex: 1,
        marginLeft: 12,
    },
    summaryCard: {
        backgroundColor: "#F8F9FD",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: "#666",
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    summaryLabelBold: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    summaryTotal: {
        fontSize: 20,
        fontWeight: "800",
        color: "#39C7fD",
    },
    devNote: {
        fontSize: 12,
        color: "#F57C00",
        marginTop: 8,
        fontStyle: "italic",
    },
    radioGroup: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    radioOption: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#E8E8E8",
        backgroundColor: "#fff",
    },
    radioOptionSelected: {
        borderColor: "#39C7fD",
        backgroundColor: "#F0F9FF",
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#E8E8E8",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#39C7fD",
    },
    radioText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
        flex: 1,
    },
    identificationRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    identificationButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#E8E8E8",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    identificationButtonSelected: {
        borderColor: "#39C7fD",
        backgroundColor: "#F0F9FF",
    },
    identificationText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    identificationTextSelected: {
        color: "#39C7fD",
    },
    input: {
        height: 50,
        backgroundColor: "#F8F9FD",
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#E8E8E8",
        fontSize: 16,
        color: "#1A1A1A",
        marginBottom: 24,
    },
    payButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#39C7fD",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginBottom: 20,
    },
    payButtonDisabled: {
        backgroundColor: "#B0BEC5",
    },
    payButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    statusContainer: {
        padding: 40,
        alignItems: "center",
    },
    successIcon: {
        marginBottom: 20,
    },
    statusTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 8,
        textAlign: "center",
    },
    statusSubtext: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
});