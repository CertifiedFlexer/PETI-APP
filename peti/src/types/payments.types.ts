/**
 * Payment Types
 * Tipos para el sistema de pagos y promociones
 */

export type PromotionTier = 'top10';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type PaymentMethod = 'pse';

export interface PromotionPlan {
    id: string;
    name: string;
    tier: PromotionTier;
    duration_days: number;
    price: number;
    currency: string;
    features: string[];
    popular?: boolean;
}

export interface PromotionStatus {
    is_promoted: boolean;
    promotion_tier: PromotionTier | null;
    promotion_started_at: string | null; // ISO date
    promotion_expires_at: string | null; // ISO date
    days_remaining: number;
}

export interface PSEBank {
    id: string;
    name: string;
    code: string;
}

export interface CreatePaymentIntentData {
    provider_id: string;
    plan_id: string;
    amount: number;
    currency: string;
    payment_method: PaymentMethod;
    bank_code?: string; // Para PSE
}

export interface PaymentIntent {
    id: string;
    provider_id: string;
    plan_id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    payment_method: PaymentMethod;
    pse_url?: string; // URL de redirección para PSE
    created_at: string;
}

export interface ProcessPaymentData {
    payment_intent_id: string;
    bank_code: string;
    user_type: 'natural' | 'juridica';
    identification_type: 'CC' | 'NIT' | 'CE' | 'TI';
    identification_number: string;
}

export interface PaymentResult {
    success: boolean;
    payment_id: string;
    status: PaymentStatus;
    message?: string;
    promotion_expires_at?: string;
}