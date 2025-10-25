import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
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

const PRIMARY = "#39C7fD";
const BORDER = "#ccc";
const API_URL = "http://localhost:3000/api/users";

export default function EditProfileScreen({ navigation }: any) {
    const { user, updateUser } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!name.trim()) {
            Alert.alert("Error", "El nombre no puede estar vacío");
            return false;
        }
        if (!email.trim()) {
            Alert.alert("Error", "El email no puede estar vacío");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Por favor ingresa un email válido");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/${user?.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: name,
                    email: email,
                }),
            });

            if (!response.ok) {
                const errorData = (await response.json()) as { message?: string };
                throw new Error(errorData.message || "Error al actualizar perfil");
            }

            // Actualizar contexto con nuevos datos
            await updateUser({
                name: name,
                email: email,
            });

            Alert.alert("Éxito", "Perfil actualizado correctamente", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "No se pudo actualizar el perfil");
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
                        <TouchableOpacity style={styles.changePhotoButton}>
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
                            />
                        </View>

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color={PRIMARY} />
                            <Text style={styles.infoText}>
                                Algunos cambios pueden requerir que vuelvas a iniciar sesión
                            </Text>
                        </View>
                    </View>

                    {/* Botón guardar */}
                    <TouchableOpacity
                        onPress={handleSave}
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        disabled={loading}
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
    saveButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});