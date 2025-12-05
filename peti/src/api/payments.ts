import {
    CreatePaymentIntentData,
    PaymentIntent,
    PaymentResult,
    PaymentStatus,
    ProcessPaymentData,
    PromotionPlan,
    PromotionStatus,
    PSEBank,
} from '../types/payments.types';

const API_URL = "http://localhost:3000";
const USE_MOCK_DATA = true; // ⚠️ Cambiar a false cuando el backend esté listo

// ==========================================
//  MOCK DATA
// ==========================================

const MOCK_PSE_BANKS: PSEBank[] = [
    { id: '1', name: 'Bancolombia', code: 'BANCOLOMBIA' },
    { id: '2', name: 'Banco de Bogotá', code: 'BANCO_BOGOTA' },
    { id: '3', name: 'Davivienda', code: 'DAVIVIENDA' },
    { id: '4', name: 'BBVA Colombia', code: 'BBVA' },
    { id: '5', name: 'Banco Popular', code: 'BANCO_POPULAR' },
    { id: '6', name: 'Banco de Occidente', code: 'BANCO_OCCIDENTE' },
    { id: '7', name: 'Banco Caja Social', code: 'BANCO_CAJA_SOCIAL' },
    { id: '8', name: 'Banco AV Villas', code: 'BANCO_AV_VILLAS' },
];

const PROMOTION_PLANS: PromotionPlan[] = [
    {
        id: 'top10-monthly',
        name: 'Top 10 Mensual',
        tier: 'top10',
        duration_days: 30,
        price: 0, // Gratis para desarrollo
        currency: 'COP',
        features: [
            'Aparece en los primeros 10 resultados',
            'Badge de "Promocionado"',
            'Mayor visibilidad',
            'Estadísticas de vistas',
        ],
        popular: true,
    },
];

// Storage en memoria para promociones activas
let mockPromotionStorage: Record<string, PromotionStatus> = {};

// ==========================================
//  API FUNCTIONS
// ==========================================

/**
 * Obtener planes de promoción disponibles
 */
export const getPromotionPlans = async (): Promise<PromotionPlan[]> => {
    if (USE_MOCK_DATA) {
        console.log('🎯 MOCK: Obteniendo planes de promoción');
        await new Promise(resolve => setTimeout(resolve, 300));
        return PROMOTION_PLANS;
    }

    try {
        const response = await fetch(`${API_URL}/api/promotions/plans`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error("Error al obtener planes de promoción");
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching promotion plans:', error);
        throw error;
    }
};

/**
 * Obtener lista de bancos PSE
 */
export const getPSEBanks = async (): Promise<PSEBank[]> => {
    if (USE_MOCK_DATA) {
        console.log('🏦 MOCK: Obteniendo lista de bancos PSE');
        await new Promise(resolve => setTimeout(resolve, 200));
        return MOCK_PSE_BANKS;
    }

    try {
        const response = await fetch(`${API_URL}/api/payments/pse/banks`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error("Error al obtener bancos PSE");
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching PSE banks:', error);
        throw error;
    }
};

/**
 * Crear intención de pago
 */
export const createPaymentIntent = async (
    data: CreatePaymentIntentData,
    token: string
): Promise<PaymentIntent> => {
    if (USE_MOCK_DATA) {
        console.log('💳 MOCK: Creando intención de pago');
        console.log('📦 Datos:', data);
        
        await new Promise(resolve => setTimeout(resolve, 500));

        const paymentIntent: PaymentIntent = {
            id: `pi-mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            provider_id: data.provider_id,
            plan_id: data.plan_id,
            amount: data.amount,
            currency: data.currency,
            status: 'pending',
            payment_method: data.payment_method,
            pse_url: 'https://mock-pse-gateway.com/payment', // URL mock
            created_at: new Date().toISOString(),
        };

        console.log('✅ MOCK: Intención de pago creada:', paymentIntent.id);
        return paymentIntent;
    }

    try {
        const response = await fetch(`${API_URL}/api/payments/intent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(errorData.message || "Error al crear intención de pago");
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

/**
 * Procesar pago con PSE (simulación para desarrollo)
 */
export const processPayment = async (
    data: ProcessPaymentData,
    token: string
): Promise<PaymentResult> => {
    if (USE_MOCK_DATA) {
        console.log('🔄 MOCK: Procesando pago PSE');
        console.log('📦 Datos:', data);
        
        // Simular procesamiento (2 segundos)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // ⚠️ En desarrollo, SIEMPRE exitoso (sin cobro real)
        const plan = PROMOTION_PLANS.find(p => p.id === 'top10-monthly');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (plan?.duration_days || 30));

        const result: PaymentResult = {
            success: true,
            payment_id: `pay-${Date.now()}`,
            status: 'completed',
            message: 'Pago procesado exitosamente (simulado)',
            promotion_expires_at: expiresAt.toISOString(),
        };

        console.log('✅ MOCK: Pago procesado exitosamente');
        return result;
    }

    try {
        const response = await fetch(`${API_URL}/api/payments/process`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(errorData.message || "Error al procesar el pago");
        }

        return await response.json();
    } catch (error) {
        console.error('Error processing payment:', error);
        throw error;
    }
};

/**
 * Activar promoción en el proveedor
 */
export const activatePromotion = async (
    providerId: string,
    planId: string,
    paymentId: string,
    token: string
): Promise<PromotionStatus> => {
    if (USE_MOCK_DATA) {
        console.log('🚀 MOCK: Activando promoción');
        console.log('📦 Provider:', providerId, '| Plan:', planId);
        
        await new Promise(resolve => setTimeout(resolve, 500));

        const plan = PROMOTION_PLANS.find(p => p.id === planId);
        const startDate = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (plan?.duration_days || 30));

        const promotionStatus: PromotionStatus = {
            is_promoted: true,
            promotion_tier: 'top10',
            promotion_started_at: startDate.toISOString(),
            promotion_expires_at: expiresAt.toISOString(),
            days_remaining: plan?.duration_days || 30,
        };

        // Guardar en storage mock
        mockPromotionStorage[providerId] = promotionStatus;

        console.log('✅ MOCK: Promoción activada exitosamente');
        return promotionStatus;
    }

    try {
        const response = await fetch(`${API_URL}/api/providers/${providerId}/promote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ plan_id: planId, payment_id: paymentId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(errorData.message || "Error al activar promoción");
        }

        return await response.json();
    } catch (error) {
        console.error('Error activating promotion:', error);
        throw error;
    }
};

/**
 * Obtener estado de promoción de un proveedor
 */
export const getPromotionStatus = async (
    providerId: string,
    token: string
): Promise<PromotionStatus> => {
    if (USE_MOCK_DATA) {
        console.log('📊 MOCK: Obteniendo estado de promoción');
        await new Promise(resolve => setTimeout(resolve, 200));

        const status = mockPromotionStorage[providerId];
        
        if (status) {
            // Calcular días restantes
            const now = new Date();
            const expires = new Date(status.promotion_expires_at || '');
            const daysRemaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            
            return {
                ...status,
                days_remaining: daysRemaining,
                is_promoted: daysRemaining > 0,
            };
        }

        return {
            is_promoted: false,
            promotion_tier: null,
            promotion_started_at: null,
            promotion_expires_at: null,
            days_remaining: 0,
        };
    }

    try {
        const response = await fetch(`${API_URL}/api/providers/${providerId}/promotion`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al obtener estado de promoción");
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching promotion status:', error);
        throw error;
    }
};

/**
 * Verificar estado de un pago
 */
export const checkPaymentStatus = async (
    paymentId: string,
    token: string
): Promise<PaymentStatus> => {
    if (USE_MOCK_DATA) {
        console.log('🔍 MOCK: Verificando estado de pago');
        await new Promise(resolve => setTimeout(resolve, 300));
        return 'completed';
    }

    try {
        const response = await fetch(`${API_URL}/api/payments/${paymentId}/status`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al verificar estado del pago");
        }

        const data = await response.json() as { status: PaymentStatus };
        return data.status;
    } catch (error) {
        console.error('Error checking payment status:', error);
        throw error;
    }
};

// ==========================================
//  UTILIDADES DE DESARROLLO
// ==========================================

/**
 * Limpiar todas las promociones mock
 */
export const clearMockPromotions = (): void => {
    if (USE_MOCK_DATA) {
        mockPromotionStorage = {};
        console.log('🗑️ Todas las promociones mock han sido eliminadas');
    }
};

/**
 * Ver todas las promociones mock activas
 */
export const debugMockPromotions = (): void => {
    if (USE_MOCK_DATA) {
        console.log('🐛 DEBUG: Promociones activas:', mockPromotionStorage);
        console.log('📊 Total:', Object.keys(mockPromotionStorage).length);
    }
};