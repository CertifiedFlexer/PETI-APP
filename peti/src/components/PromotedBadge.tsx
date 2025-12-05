import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface PromotedBadgeProps {
    variant?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

/**
 * Badge visual para identificar proveedores promocionados
 * 
 * @param variant - Tamaño del badge (small | medium | large)
 * @param style - Estilos adicionales
 */
export const PromotedBadge: React.FC<PromotedBadgeProps> = ({ 
    variant = 'medium',
    style 
}) => {
    const containerStyle = [
        styles.container,
        variant === 'small' && styles.containerSmall,
        variant === 'medium' && styles.containerMedium,
        variant === 'large' && styles.containerLarge,
        style,
    ];

    const textStyle = [
        styles.text,
        variant === 'small' && styles.textSmall,
        variant === 'medium' && styles.textMedium,
        variant === 'large' && styles.textLarge,
    ];

    const iconSize = variant === 'small' ? 12 : variant === 'large' ? 18 : 14;

    return (
        <View style={containerStyle}>
            <Ionicons name="star" size={iconSize} color="#FFD700" />
            <Text style={textStyle}>Promocionado</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#FFF9E6',
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    containerSmall: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        gap: 4,
    },
    containerMedium: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        gap: 5,
    },
    containerLarge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        gap: 6,
    },
    text: {
        color: '#B8860B',
        fontWeight: '700',
    },
    textSmall: {
        fontSize: 10,
    },
    textMedium: {
        fontSize: 12,
    },
    textLarge: {
        fontSize: 14,
    },
});