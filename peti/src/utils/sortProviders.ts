import { PromotionStatus } from '../types/payments.types';

export interface ProviderWithPromotion {
    id_proveedor: string;
    nombre_negocio: string;
    tipo_servicio: string;
    telefono: string;
    email: string;
    descripcion: string;
    image_url: string;
    puntuacion: number;
    direccion: string;
    promotion?: PromotionStatus;
}

/**
 * Ordena proveedores priorizando:
 * 1. Proveedores promocionados (is_promoted = true)
 * 2. Dentro de promocionados, por fecha de inicio (más reciente primero)
 * 3. Proveedores no promocionados por puntuación descendente
 * 
 * @param providers - Lista de proveedores
 * @returns Lista ordenada de proveedores
 */
export const sortProvidersByPromotion = <T extends ProviderWithPromotion>(
    providers: T[]
): T[] => {
    return [...providers].sort((a, b) => {
        const aPromoted = a.promotion?.is_promoted || false;
        const bPromoted = b.promotion?.is_promoted || false;

        // 1. Promocionados primero
        if (aPromoted && !bPromoted) return -1;
        if (!aPromoted && bPromoted) return 1;

        // 2. Si ambos están promocionados, ordenar por fecha de inicio (más reciente primero)
        if (aPromoted && bPromoted) {
            const aStarted = new Date(a.promotion?.promotion_started_at || 0).getTime();
            const bStarted = new Date(b.promotion?.promotion_started_at || 0).getTime();
            return bStarted - aStarted;
        }

        // 3. Si ninguno está promocionado, ordenar por puntuación
        return (b.puntuacion || 0) - (a.puntuacion || 0);
    });
};

/**
 * Verifica si una promoción está activa
 * 
 * @param promotion - Estado de promoción
 * @returns true si la promoción está activa
 */
export const isPromotionActive = (promotion?: PromotionStatus): boolean => {
    if (!promotion || !promotion.is_promoted) return false;

    if (!promotion.promotion_expires_at) return false;

    const now = new Date();
    const expires = new Date(promotion.promotion_expires_at);
    
    return expires > now;
};

/**
 * Calcula días restantes de una promoción
 * 
 * @param promotion - Estado de promoción
 * @returns Número de días restantes (0 si expiró)
 */
export const getPromotionDaysRemaining = (promotion?: PromotionStatus): number => {
    if (!promotion || !promotion.promotion_expires_at) return 0;

    const now = new Date();
    const expires = new Date(promotion.promotion_expires_at);
    const daysRemaining = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysRemaining);
};

/**
 * Formatea la fecha de expiración de una promoción
 * 
 * @param dateString - Fecha en formato ISO
 * @returns Fecha formateada
 */
export const formatPromotionExpiry = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (error) {
        return '';
    }
};