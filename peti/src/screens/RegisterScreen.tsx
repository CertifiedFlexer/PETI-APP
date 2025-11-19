import * as React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useToast } from '../context/ToastContext';

const PRIMARY = '#39C7fD';
const INPUT_BG = '#f9f9f9';
const BORDER = '#ccc';
const API_URL = 'http://localhost:3000/api/users';

export default function RegisterScreen() {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const { showSuccess, showError, showWarning } = useToast();

    const validate = () => {
        // Validación de campos vacíos con mensajes específicos
        if (!name.trim()) {
            showWarning('Por favor ingresa tu nombre');
            return false;
        }

        if (!email.trim()) {
            showWarning('Por favor ingresa tu email');
            return false;
        }

        if (!password) {
            showWarning('Por favor ingresa una contraseña');
            return false;
        }

        if (!phone.trim()) {
            showWarning('Por favor ingresa tu teléfono');
            return false;
        }

        // Validación de formato de email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            showError('El formato del email es inválido');
            return false;
        }

        // Validación de longitud de contraseña
        if (password.length < 6) {
            showWarning('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        // Validación de formato de teléfono
        if (phone.length < 7) {
            showWarning('El teléfono debe tener al menos 7 dígitos');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        console.log('🔵 Iniciando registro...');
        console.log('Datos:', { name, email, password: '***', phone });
        
        if (!validate()) {
            console.log('❌ Validación falló');
            return;
        }
        
        console.log('✅ Validación pasó');
        setLoading(true);
        
        try {
            const bodyData = {
                nombre: name,
                email: email,
                contraseña: password,
                rol: 'admin',
            };
            
            console.log('📤 Enviando datos al servidor...');
            console.log('📡 URL:', API_URL);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });

            console.log('📥 Response status:', response.status);
            
            const data = (await response.json()) as { message?: string };
            console.log('📥 Response data:', data);

            if (!response.ok) {
                // Manejo de errores específicos del servidor
                if (response.status === 400) {
                    showError(data.message || 'Datos inválidos. Verifica la información');
                } else if (response.status === 409) {
                    showError('Este email ya está registrado');
                } else if (response.status === 500) {
                    showError('Error en el servidor. Intenta más tarde');
                } else {
                    showError(data.message || 'Error al crear usuario');
                }
                return;
            }

            // Registro exitoso
            console.log('✅ Registro exitoso');
            showSuccess('Cuenta creada exitosamente');
            
            // Limpiar formulario después de un pequeño delay
            setTimeout(() => {
                setName('');
                setEmail('');
                setPassword('');
                setPhone('');
            }, 1500);

        } catch (error: any) {
            console.error('❌ Error en registro:', error);
            
            // Manejo de errores de red
            if (error.message === 'Network request failed' || error.message.includes('fetch')) {
                showError('Error de conexión. Verifica tu internet');
            } else if (error.message.includes('timeout')) {
                showError('La solicitud tardó demasiado. Intenta de nuevo');
            } else {
                showError(error.message || 'No se pudo completar el registro');
            }
        } finally {
            setLoading(false);
            console.log('🔵 Proceso finalizado');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView 
                contentContainerStyle={styles.container} 
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.header}>Crear cuenta</Text>

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
                        returnKeyType="next"
                        editable={!loading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Contraseña</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Mínimo 6 caracteres"
                        style={styles.input}
                        secureTextEntry
                        returnKeyType="next"
                        editable={!loading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Teléfono</Text>
                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="+57"
                        style={styles.input}
                        keyboardType="phone-pad"
                        returnKeyType="done"
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleRegister}
                    style={[styles.submit, loading && styles.submitDisabled]}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitText}>
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.note}>
                    Al registrarte aceptas los términos y condiciones.
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        color: '#000',
        textAlign: 'center',
    },
    field: {
        marginBottom: 14,
    },
    label: {
        fontSize: 13,
        color: '#666',
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
        color: '#111',
    },
    submit: {
        marginTop: 10,
        backgroundColor: PRIMARY,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    submitDisabled: {
        opacity: 0.6,
    },
    submitText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    note: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginTop: 6,
    },
});