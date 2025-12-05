import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { updateUserProfile } from "../api/user";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const PRIMARY = "#39C7fD";
const BORDER = "#ccc";

export default function EditProfileScreen({ navigation }: any) {
    const { user, token, updateUser } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);

    const validate = () => {
        console.log('🔍 Validando campos:');
        console.log('  - Nombre:', name, '| Válido:', !!name.trim());
        console.log('  - Email:', email, '| Válido:', !!email.trim());

        if (!name.trim()) {
            showWarning('Por favor ingresa tu nombre');
            return false;
        }

        if (!email.trim()) {
            showWarning('Por favor ingresa tu email');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('El formato del email es inválido');
            return false;
        }

        // Validar si realmente hubo cambios
        if (name === user?.name && email === user?.email) {
            showWarning('No has realizado ningún cambio');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        console.log('📝 Iniciando actualización de perfil...');
        
        if (!validate()) {
            console.log('❌ Validación falló');
            return;
        }

        if (!user?.userId) {
            showError('No se pudo identificar el usuario. Inicia sesión nuevamente');
            return;
        }

        if (!token) {
            showError('No se pudo verificar tu sesión. Inicia sesión nuevamente');
            return;
        }

        console.log('✅ Validación pasó');
        setLoading(true);
        
        try {
            const updateData = {
                id_usuario: user.userId,
                ...(name !== user?.name && { nombre: name }),
                ...(email !== user?.email && { email: email })
            };

            console.log('📤 Enviando datos:', updateData);

            const response = await updateUserProfile(updateData, token);

            console.log('✅ Respuesta del servidor:', response);

            // Actualizar contexto con nuevos datos
            await updateUser({
                name: name,
                email: email,
            });

            showSuccess('Perfil actualizado correctamente');
            
            // Volver a la pantalla anterior después de un pequeño delay
            setTimeout(() => {
                navigation.goBack();
            }, 1500);

        } catch (error: any) {
            console.error('❌ Error en actualización:', error);
            
            if (error.message === 'Network request failed' || error.message.includes('fetch')) {
                showError('Error de conexión. Verifica tu internet');
            } else if (error.message.includes('timeout')) {
                showError('La solicitud tardó demasiado. Intenta de nuevo');
            } else {
                showError(error.message || 'No se pudo actualizar el perfil');
            }
        } finally {
            setLoading(false);
            console.log('🏁 Proceso finalizado');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                    disabled={loading}
                >
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={50} color="#fff" />
                        </View>
                        <TouchableOpacity 
                            style={styles.changePhotoButton}
                            disabled={loading}
                        >
                            <Text style={styles.changePhotoText}>Cambiar foto</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Formulario */}
                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Nombre</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Tu nombre"
                                style={styles.input}
                                returnKeyType="next"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="tu@ejemplo.com"
                                style={styles.input}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="done"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color={PRIMARY} />
                            <Text style={styles.infoText}>
                                Los cambios se guardarán inmediatamente
                            </Text>
                        </View>
                    </View>

                    {/* Botón guardar */}
                    <TouchableOpacity
                        onPress={handleSave}
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    scrollContent: {
        padding: 20,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: PRIMARY,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    changePhotoButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    changePhotoText: {
        fontSize: 15,
        color: PRIMARY,
        fontWeight: "600",
    },
    form: {
        marginBottom: 20,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
        fontWeight: "600",
    },
    input: {
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: BORDER,
        fontSize: 16,
        color: "#111",
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: PRIMARY + "15",
        padding: 12,
        borderRadius: 12,
        marginTop: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#666",
        marginLeft: 8,
        lineHeight: 18,
    },
    saveButton: {
        backgroundColor: PRIMARY,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: PRIMARY,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});