import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
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
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const PRIMARY = "#39C7fD";
const BORDER = "#ccc";
const API_URL = "http://localhost:3000/api/providers";

type RootStackParamList = {
    Main: undefined;
    RegisterProveedor: { userId?: string } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "RegisterProveedor">;

export default function RegisterBusinessScreen(_props: Props) {
    const [nombreNegocio, setNombreNegocio] = React.useState("");
    const [tipoServicio, setTipoServicio] = React.useState("");
    const [telefono, setTelefono] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [descripcion, setDescripcion] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const { user } = React.useContext(AuthContext);
    const { showSuccess, showError, showWarning } = useToast();

    const validate = () => {
        // Validar campos vacíos con mensajes específicos
        if (!nombreNegocio.trim()) {
            showWarning("Por favor ingresa el nombre del negocio");
            return false;
        }

        if (!tipoServicio.trim()) {
            showWarning("Por favor ingresa el tipo de servicio");
            return false;
        }

        if (!telefono.trim()) {
            showWarning("Por favor ingresa el número de teléfono");
            return false;
        }

        if (!email.trim()) {
            showWarning("Por favor ingresa el correo electrónico");
            return false;
        }

        // Validar formato de teléfono
        const phoneRegex = /^\d{7,15}$/;
        if (!phoneRegex.test(telefono)) {
            showError("El teléfono debe contener solo números (7-15 dígitos)");
            return false;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError("El formato del email es inválido");
            return false;
        }

        return true;
    };

    const handleRegisterBusiness = async () => {
        if (!user?.userId) {
            showError("No se pudo identificar el usuario. Inicia sesión nuevamente");
            return;
        }

        if (!validate()) return;

        setLoading(true);
        try {
            const bodyData = {
                nombre_negocio: nombreNegocio,
                tipo_servicio: tipoServicio,
                telefono,
                email,
                id_usuario: user.userId,
                descripcion: descripcion || null
            };

            console.log('📤 Enviando datos:', bodyData);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})) as { message?: string };
                
                if (response.status === 400) {
                    showError(errorData.message || "Datos inválidos. Verifica la información");
                } else if (response.status === 409) {
                    showError("Este email ya está registrado");
                } else if (response.status === 500) {
                    showError("Error en el servidor. Intenta más tarde");
                } else {
                    showError(errorData.message || "Error al registrar el negocio");
                }
                return;
            }

            showSuccess("Negocio registrado correctamente");
            
            // Limpiar formulario después de un pequeño delay
            setTimeout(() => {
                setNombreNegocio("");
                setTipoServicio("");
                setTelefono("");
                setEmail("");
                setDescripcion("");
            }, 1500);

        } catch (error: any) {
            console.error("❌ Error en registro:", error);
            
            if (error.message === 'Network request failed' || error.message.includes('fetch')) {
                showError("Error de conexión. Verifica tu internet");
            } else if (error.message.includes('timeout')) {
                showError("La solicitud tardó demasiado. Intenta de nuevo");
            } else {
                showError(error.message || "No se pudo completar el registro");
            }
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
                    <Text style={styles.label}>
                        Nombre del negocio <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        value={nombreNegocio}
                        onChangeText={setNombreNegocio}
                        placeholder="Ej: Pet Shop La 80"
                        style={styles.input}
                        editable={!loading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>
                        Tipo de servicio <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        value={tipoServicio}
                        onChangeText={setTipoServicio}
                        placeholder="Veterinaria, Peluquería, Tienda, etc."
                        style={styles.input}
                        editable={!loading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>
                        Teléfono <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        value={telefono}
                        onChangeText={setTelefono}
                        placeholder="Ej: 3204567890"
                        style={styles.input}
                        keyboardType="phone-pad"
                        editable={!loading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>
                        Correo electrónico <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Ej: contacto@negocio.com"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Descripción (Opcional)</Text>
                    <TextInput
                        value={descripcion}
                        onChangeText={setDescripcion}
                        placeholder="Descripción breve del negocio"
                        style={[styles.input, styles.textArea]}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleRegisterBusiness}
                    style={[styles.submit, loading && styles.submitDisabled]}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitText}>
                        {loading ? "Registrando..." : "Registrar Negocio"}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.note}>
                    <Text style={styles.required}>* </Text>
                    Campos obligatorios
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
        fontWeight: "600",
    },
    required: {
        color: "#EF5350",
        fontWeight: "700",
    },
    input: {
        height: 48,
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: BORDER,
        fontSize: 16,
        color: "#111",
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    submit: {
        marginTop: 10,
        backgroundColor: PRIMARY,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
    },
    submitDisabled: {
        opacity: 0.6,
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