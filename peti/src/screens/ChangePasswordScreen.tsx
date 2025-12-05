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
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const PRIMARY = "#39C7fD";
const BORDER = "#ccc";
const API_URL = "https://peti-back.onrender.com/api";

export default function ChangePasswordScreen({ navigation }: any) {
    const { user } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const validate = () => {
        // Validar campos vacíos con mensajes específicos
        if (!currentPassword) {
            showWarning("Por favor ingresa tu contraseña actual");
            return false;
        }

        if (!newPassword) {
            showWarning("Por favor ingresa tu nueva contraseña");
            return false;
        }

        if (!confirmPassword) {
            showWarning("Por favor confirma tu nueva contraseña");
            return false;
        }

        // Validar longitud de contraseña
        if (newPassword.length < 6) {
            showWarning("La nueva contraseña debe tener al menos 6 caracteres");
            return false;
        }

        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            showError("Las contraseñas no coinciden");
            return false;
        }

        // Validar que la nueva contraseña sea diferente
        if (currentPassword === newPassword) {
            showWarning("La nueva contraseña debe ser diferente a la actual");
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        if (!validate()) return;

        if (!user?.userId) {
            showError("No se pudo identificar el usuario");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/${user.userId}/change-password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                }),
            });

            if (!response.ok) {
                const errorData = (await response.json()) as { message?: string };
                
                if (response.status === 401) {
                    showError("La contraseña actual es incorrecta");
                } else if (response.status === 400) {
                    showError(errorData.message || "Datos inválidos");
                } else if (response.status === 404) {
                    showError("Usuario no encontrado");
                } else {
                    showError(errorData.message || "Error al cambiar la contraseña");
                }
                return;
            }

            showSuccess("Contraseña actualizada correctamente");

            // Limpiar campos
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Volver a la pantalla anterior después de un pequeño delay
            setTimeout(() => {
                navigation.goBack();
            }, 1500);

        } catch (error: any) {
            console.error("Error changing password:", error);
            
            if (error.message === 'Network request failed' || error.message.includes('fetch')) {
                showError("Error de conexión. Verifica tu internet");
            } else {
                showError(error.message || "No se pudo cambiar la contraseña");
            }
        } finally {
            setLoading(false);
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
                <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Icono de seguridad */}
                    <View style={styles.iconSection}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="lock-closed" size={40} color={PRIMARY} />
                        </View>
                        <Text style={styles.description}>
                            Asegúrate de usar una contraseña segura con al menos 6 caracteres
                        </Text>
                    </View>

                    {/* Formulario */}
                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Contraseña Actual</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Ingresa tu contraseña actual"
                                    style={styles.input}
                                    secureTextEntry={!showCurrent}
                                    returnKeyType="next"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowCurrent(!showCurrent)}
                                    style={styles.eyeButton}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showCurrent ? "eye-off" : "eye"}
                                        size={22}
                                        color="#999"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Nueva Contraseña</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Mínimo 6 caracteres"
                                    style={styles.input}
                                    secureTextEntry={!showNew}
                                    returnKeyType="next"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowNew(!showNew)}
                                    style={styles.eyeButton}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showNew ? "eye-off" : "eye"}
                                        size={22}
                                        color="#999"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Repite tu nueva contraseña"
                                    style={styles.input}
                                    secureTextEntry={!showConfirm}
                                    returnKeyType="done"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirm(!showConfirm)}
                                    style={styles.eyeButton}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showConfirm ? "eye-off" : "eye"}
                                        size={22}
                                        color="#999"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Requisitos de contraseña */}
                        <View style={styles.requirementsBox}>
                            <Text style={styles.requirementsTitle}>Requisitos:</Text>
                            <View style={styles.requirement}>
                                <Ionicons
                                    name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                                    size={18}
                                    color={newPassword.length >= 6 ? "#4CAF50" : "#999"}
                                />
                                <Text style={styles.requirementText}>Mínimo 6 caracteres</Text>
                            </View>
                            <View style={styles.requirement}>
                                <Ionicons
                                    name={
                                        newPassword && confirmPassword && newPassword === confirmPassword
                                            ? "checkmark-circle"
                                            : "ellipse-outline"
                                    }
                                    size={18}
                                    color={
                                        newPassword && confirmPassword && newPassword === confirmPassword
                                            ? "#4CAF50"
                                            : "#999"
                                    }
                                />
                                <Text style={styles.requirementText}>Las contraseñas coinciden</Text>
                            </View>
                            <View style={styles.requirement}>
                                <Ionicons
                                    name={
                                        newPassword && currentPassword && newPassword !== currentPassword
                                            ? "checkmark-circle"
                                            : "ellipse-outline"
                                    }
                                    size={18}
                                    color={
                                        newPassword && currentPassword && newPassword !== currentPassword
                                            ? "#4CAF50"
                                            : "#999"
                                    }
                                />
                                <Text style={styles.requirementText}>Diferente a la actual</Text>
                            </View>
                        </View>
                    </View>

                    {/* Botón guardar */}
                    <TouchableOpacity
                        onPress={handleChangePassword}
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? "Actualizando..." : "Actualizar Contraseña"}
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
    iconSection: {
        alignItems: "center",
        marginBottom: 30,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: PRIMARY + "20",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 20,
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
    passwordContainer: {
        position: "relative",
    },
    input: {
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingRight: 50,
        borderWidth: 1,
        borderColor: BORDER,
        fontSize: 16,
        color: "#111",
    },
    eyeButton: {
        position: "absolute",
        right: 12,
        top: 14,
        padding: 4,
    },
    requirementsBox: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        marginTop: 8,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    requirement: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },
    requirementText: {
        fontSize: 13,
        color: "#666",
        marginLeft: 8,
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