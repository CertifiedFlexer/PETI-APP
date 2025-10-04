import * as React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';

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

    const validate = () => {
        if (!name.trim() || !email.trim() || !password || !phone.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return false;
        }
        // email simple regex
        const re = /^\S+@\S+\.\S+$/;
        if (!re.test(email)) {
            Alert.alert('Email inválido', 'Por favor ingresa un email válido');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        console.log('🔵 Iniciando registro...');
        console.log('Datos:', { name, email, password, phone });
        
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
            
            console.log('📤 Enviando datos:', bodyData);
            console.log('📡 URL:', API_URL);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });

            console.log('📥 Response status:', response.status);
            
            const data = await response.json();
            console.log('📥 Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear usuario');
            }

            // Registro exitoso
            console.log('✅ Registro exitoso');
            Alert.alert(
                'Éxito',
                'Tu cuenta ha sido creada correctamente',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form
                            setName('');
                            setEmail('');
                            setPassword('');
                            setPhone('');
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error('❌ Error en registro:', error);
            console.error('Error completo:', JSON.stringify(error, null, 2));
            Alert.alert(
                'Error', 
                error.message || 'No se pudo completar el registro. Intenta de nuevo.'
            );
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
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.header}>Crear cuenta</Text>

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
                        returnKeyType="next"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Contraseña</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        style={styles.input}
                        secureTextEntry
                        returnKeyType="next"
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
                    />
                </View>

                <TouchableOpacity
                    onPress={handleRegister}
                    style={[styles.submit, loading ? { opacity: 0.7 } : {}]}
                    disabled={loading}
                >
                    <Text style={styles.submitText}>{loading ? 'Creando...' : 'Crear cuenta'}</Text>
                </TouchableOpacity>

                <Text style={styles.note}>Al registrarte aceptas los términos y condiciones.</Text>
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