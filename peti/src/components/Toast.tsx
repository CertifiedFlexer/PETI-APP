import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    visible: boolean;
    onHide: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type,
    visible,
    onHide,
    duration = 4000
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            // Animación de entrada
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    tension: 65,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-hide después del duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
        });
    };

    if (!visible) return null;

    const getToastConfig = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: '#4CAF50',
                    icon: 'checkmark-circle' as const,
                    iconColor: '#fff',
                };
            case 'error':
                return {
                    backgroundColor: '#EF5350',
                    icon: 'close-circle' as const,
                    iconColor: '#fff',
                };
            case 'warning':
                return {
                    backgroundColor: '#FF9800',
                    icon: 'warning' as const,
                    iconColor: '#fff',
                };
            case 'info':
                return {
                    backgroundColor: '#2196F3',
                    icon: 'information-circle' as const,
                    iconColor: '#fff',
                };
            default:
                return {
                    backgroundColor: '#2196F3',
                    icon: 'information-circle' as const,
                    iconColor: '#fff',
                };
        }
    };

    const config = getToastConfig();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={[styles.toast, { backgroundColor: config.backgroundColor }]}>
                <Ionicons
                    name={config.icon}
                    size={24}
                    color={config.iconColor}
                    style={styles.icon}
                />
                <Text style={styles.message} numberOfLines={3}>
                    {message}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 9999,
        elevation: 9999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
    },
});

export default Toast;