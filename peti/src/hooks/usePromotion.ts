import { useState } from 'react';
import { activatePromotion, createPaymentIntent, getPSEBanks, getPromotionPlans, processPayment } from '../api/payments';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PaymentIntent, PromotionPlan, PromotionStatus, PSEBank } from '../types/payments.types';

interface UsePromotionReturn {
    // State
    plans: PromotionPlan[];
    banks: PSEBank[];
    selectedPlan: PromotionPlan | null;
    selectedBank: PSEBank | null;
    paymentIntent: PaymentIntent | null;
    loading: boolean;
    processing: boolean;
    
    // Actions
    loadPlans: () => Promise<void>;
    loadBanks: () => Promise<void>;
    selectPlan: (plan: PromotionPlan) => void;
    selectBank: (bank: PSEBank) => void;
    initiatePayment: (providerId: string) => Promise<PaymentIntent | null>;
    completePayment: (
        identificationType: 'CC' | 'NIT' | 'CE' | 'TI',
        identificationNumber: string,
        userType: 'natural' | 'juridica'
    ) => Promise<PromotionStatus | null>;
    reset: () => void;
}

/**
 * Custom hook para manejar el flujo completo de promoción
 * 
 * Separa toda la lógica de negocio de la UI
 */
export const usePromotion = (): UsePromotionReturn => {
    const { token } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();

    const [plans, setPlans] = useState<PromotionPlan[]>([]);
    const [banks, setBanks] = useState<PSEBank[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<PromotionPlan | null>(null);
    const [selectedBank, setSelectedBank] = useState<PSEBank | null>(null);
    const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    /**
     * Cargar planes de promoción disponibles
     */
    const loadPlans = async (): Promise<void> => {
        setLoading(true);
        try {
            const data = await getPromotionPlans();
            setPlans(data);
        } catch (error: any) {
            console.error('Error loading plans:', error);
            showError('Error al cargar planes de promoción');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cargar lista de bancos PSE
     */
    const loadBanks = async (): Promise<void> => {
        setLoading(true);
        try {
            const data = await getPSEBanks();
            setBanks(data);
        } catch (error: any) {
            console.error('Error loading banks:', error);
            showError('Error al cargar lista de bancos');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Seleccionar plan de promoción
     */
    const selectPlan = (plan: PromotionPlan): void => {
        setSelectedPlan(plan);
    };

    /**
     * Seleccionar banco para PSE
     */
    const selectBank = (bank: PSEBank): void => {
        setSelectedBank(bank);
    };

    /**
     * Iniciar proceso de pago
     */
    const initiatePayment = async (providerId: string): Promise<PaymentIntent | null> => {
        if (!token) {
            showError('No se pudo autenticar. Inicia sesión nuevamente');
            return null;
        }

        if (!selectedPlan) {
            showWarning('Selecciona un plan de promoción');
            return null;
        }

        if (!selectedBank) {
            showWarning('Selecciona tu banco');
            return null;
        }

        setProcessing(true);
        try {
            const intent = await createPaymentIntent(
                {
                    provider_id: providerId,
                    plan_id: selectedPlan.id,
                    amount: selectedPlan.price,
                    currency: selectedPlan.currency,
                    payment_method: 'pse',
                    bank_code: selectedBank.code,
                },
                token
            );

            setPaymentIntent(intent);
            return intent;
        } catch (error: any) {
            console.error('Error initiating payment:', error);
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                showError('Error de conexión. Verifica tu internet');
            } else {
                showError(error.message || 'Error al iniciar el pago');
            }
            return null;
        } finally {
            setProcessing(false);
        }
    };

    /**
     * Completar pago y activar promoción
     */
    const completePayment = async (
        identificationType: 'CC' | 'NIT' | 'CE' | 'TI',
        identificationNumber: string,
        userType: 'natural' | 'juridica'
    ): Promise<PromotionStatus | null> => {
        if (!token) {
            showError('No se pudo autenticar. Inicia sesión nuevamente');
            return null;
        }

        if (!paymentIntent) {
            showError('No hay una intención de pago activa');
            return null;
        }

        if (!selectedPlan) {
            showError('No hay un plan seleccionado');
            return null;
        }

        if (!selectedBank) {
            showError('No hay un banco seleccionado');
            return null;
        }

        // Validar número de identificación
        if (!identificationNumber.trim()) {
            showWarning('Ingresa tu número de identificación');
            return null;
        }

        if (identificationType === 'NIT' && identificationNumber.length < 9) {
            showWarning('El NIT debe tener al menos 9 dígitos');
            return null;
        }

        if (identificationType !== 'NIT' && identificationNumber.length < 6) {
            showWarning('El número de identificación debe tener al menos 6 dígitos');
            return null;
        }

        setProcessing(true);
        try {
            // Procesar pago
            const paymentResult = await processPayment(
                {
                    payment_intent_id: paymentIntent.id,
                    bank_code: selectedBank.code,
                    user_type: userType,
                    identification_type: identificationType,
                    identification_number: identificationNumber,
                },
                token
            );

            if (!paymentResult.success) {
                throw new Error(paymentResult.message || 'Error al procesar el pago');
            }

            // Activar promoción
            const promotionStatus = await activatePromotion(
                paymentIntent.provider_id,
                selectedPlan.id,
                paymentResult.payment_id,
                token
            );

            showSuccess('¡Promoción activada exitosamente!');
            return promotionStatus;
        } catch (error: any) {
            console.error('Error completing payment:', error);
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                showError('Error de conexión. Verifica tu internet');
            } else {
                showError(error.message || 'Error al completar el pago');
            }
            return null;
        } finally {
            setProcessing(false);
        }
    };

    /**
     * Resetear estado
     */
    const reset = (): void => {
        setPlans([]);
        setBanks([]);
        setSelectedPlan(null);
        setSelectedBank(null);
        setPaymentIntent(null);
        setLoading(false);
        setProcessing(false);
    };

    return {
        // State
        plans,
        banks,
        selectedPlan,
        selectedBank,
        paymentIntent,
        loading,
        processing,

        // Actions
        loadPlans,
        loadBanks,
        selectPlan,
        selectBank,
        initiatePayment,
        completePayment,
        reset,
    };
};