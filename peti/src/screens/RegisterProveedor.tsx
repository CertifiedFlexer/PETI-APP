import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
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

const PRIMARY = "#39C7fD";
const INPUT_BG = "#f9f9f9";
const BORDER = "#ccc";
const API_URL = "http://localhost:3000/api/business"; // Cambia según tu endpoint real

type RootStackParamList = {
    Main: undefined;
    RegisterBusiness: { userId?: string } | undefined;
};

type Props = {
    userId?: string;
} & NativeStackScreenProps<RootStackParamList, "RegisterBusiness">;

export default function RegisterBusinessScreen({
    route,
    navigation,
    userId: propUserId,
}: Props) {
    const routeUserId = route?.params?.userId;
    const userId = routeUserId ?? propUserId;

    const [nombreNegocio, setNombreNegocio] = React.useState("");
    const [tipoServicio, setTipoServicio] = React.useState("");
    const [telefono, setTelefono] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    // 🔍 Validaciones
    const validate = () => {
        if (!nombreNegocio.trim()) {
            Alert.alert("Error", "Por favor ingresa el nombre del negocio");
            return false;
        }
        if (!tipoServicio.trim()) {
            Alert.alert("Error", "Por favor ingresa el tipo de servicio");
            return false;
        }
        if (!telefono.trim()) {
            Alert.alert("Error", "Por favor ingresa un número de teléfono");
            return false;
        }
        if (!/^\d{7,15}$/.test(telefono)) {
            Alert.alert("Error", "El teléfono debe contener solo números (7-15 dígitos)");
            return false;
        }
        if (!email.trim()) {
            Alert.alert("Error", "Por favor ingresa un correo electrónico");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Por favor ingresa un correo electrónico válido");
            return false;
        }

        return true;
    };

    // 🚀 Enviar datos a la API
    const handleRegisterBusiness = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const bodyData = {
                nombre_negocio: nombreNegocio,
                tipo_servicio: tipoServicio,
                telefono,
                email,
                id_usuario: userId, // si necesitas relacionarlo con el usuario logueado
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al registrar el negocio");
            }

            Alert.alert("Éxito", "El negocio ha sido registrado correctamente", [
                {
                    text: "OK",
                    onPress: () => {
                        setNombreNegocio("");
                        setTipoServicio("");
                        setTelefono("");
                        setEmail("");
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.message || "No se pudo completar el registro. Intenta de nuevo."
            );
            console.error("❌ Error en registro:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.header}>Registrar Negocio</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Nombre del negocio</Text>
                    <TextInput
                        value={nombreNegocio}
                        onChangeText={setNombreNegocio}
                        placeholder="Ej: Pet Shop La 80"
                        style={styles.input}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Tipo de servicio</Text>
                    <TextInput
                        value={tipoServicio}
                        onChangeText={setTipoServicio}
                        placeholder="Veterinaria, Peluquería, Tienda, etc."
                        style={styles.input}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Teléfono</Text>
                    <TextInput
                        value={telefono}
                        onChangeText={setTelefono}
                        placeholder="Ej: 3204567890"
                        style={styles.input}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Correo electrónico</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Ej: contacto@negocio.com"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleRegisterBusiness}
                    style={[styles.submit, loading ? { opacity: 0.7 } : {}]}
                    disabled={loading}
                >
                    <Text style={styles.submitText}>
                        {loading ? "Registrando..." : "Registrar Negocio"}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.note}>
                    Podrás editar esta información más tarde desde tu perfil.
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
    },
    header: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 20,
        color: "#000",
        textAlign: "center",
    },
    field: {
        marginBottom: 14,
    },
    label: {
        fontSize: 13,
        color: "#666",
        marginBottom: 6,
    },
    input: {
        height: 48,
        backgroundColor: INPUT_BG,
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: BORDER,
        fontSize: 16,
        color: "#111",
    },
    submit: {
        marginTop: 10,
        backgroundColor: PRIMARY,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
    },
    submitText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    note: {
        textAlign: "center",
        color: "#999",
        fontSize: 12,
        marginTop: 6,
    },
});
