import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PRIMARY = '#39C7fD';
const INPUT_BG = '#f9f9f9';
const BORDER = '#ccc';
const API_URL = 'http://localhost:3000/api/pets';

type RootStackParamList = {
    Main: undefined;
    RegisterPet: { userId?: string } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'RegisterPet'>;

export default function RegisterPetScreen(_props: Props) {
    const [nombre, setNombre] = React.useState('');
    const [especie, setEspecie] = React.useState('');
    const [raza, setRaza] = React.useState('');
    const [fechaNacimiento, setFechaNacimiento] = React.useState('');
    const [peso, setPeso] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const { user } = React.useContext(AuthContext);
    const { showSuccess, showError, showWarning } = useToast();

    const validate = () => {
        console.log('🔍 Validando campos:');
        console.log('  - Nombre:', nombre, '| Válido:', !!nombre.trim());
        console.log('  - Especie:', especie, '| Válido:', !!especie.trim());
        console.log('  - Raza:', raza, '| Válido:', !!raza.trim());
        console.log('  - Fecha:', fechaNacimiento, '| Válido:', !!fechaNacimiento.trim());
        console.log('  - Peso:', peso, '| Válido:', !!peso.trim());

        // Validar campos requeridos
        if (!nombre.trim()) {
            showWarning('Por favor ingresa el nombre de tu mascota');
            return false;
        }

        if (!especie.trim()) {
            showWarning('Por favor ingresa la especie de tu mascota');
            return false;
        }

        // Validaciones opcionales pero con formato
        if (peso && isNaN(Number(peso))) {
            showError('El peso debe ser un número válido');
            return false;
        }

        if (peso && Number(peso) <= 0) {
            showError('El peso debe ser mayor a 0');
            return false;
        }

        if (peso && Number(peso) > 500) {
            showWarning('El peso parece muy alto. Verifica el valor');
            return false;
        }

        // Validar formato de fecha si se proporciona
        if (fechaNacimiento) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/;
            if (!dateRegex.test(fechaNacimiento)) {
                showError('Formato de fecha inválido. Usa DD/MM/YYYY o YYYY-MM-DD');
                return false;
            }
        }

        return true;
    };

    const handleRegisterPet = async () => {
        console.log('🔵 Iniciando registro de mascota...');
        console.log('Usuario:', user?.userId);
        console.log('Datos:', { nombre, especie, raza, fechaNacimiento, peso });
        
        if (!user?.userId) {
            showError('No se pudo identificar el usuario. Inicia sesión nuevamente');
            return;
        }
        
        if (!validate()) {
            console.log('❌ Validación falló');
            return;
        }
        
        console.log('✅ Validación pasó');
        setLoading(true);
        
        try {
            const bodyData = {
                nombre,
                especie,
                raza: raza || null,
                fecha_nacimiento: fechaNacimiento || null,
                peso: peso ? Number(peso) : null,
                id_usuario: user.userId
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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})) as { message?: string };
                
                if (response.status === 400) {
                    showError(errorData.message || 'Datos inválidos. Verifica la información');
                } else if (response.status === 500) {
                    showError('Error en el servidor. Intenta más tarde');
                } else {
                    showError(errorData.message || 'Error al registrar mascota');
                }
                return;
            }

            console.log('✅ Registro de mascota exitoso');
            showSuccess('Mascota registrada correctamente');
            
            // Limpiar formulario después de un pequeño delay
            setTimeout(() => {
                setNombre('');
                setEspecie('');
                setRaza('');
                setFechaNacimiento('');
                setPeso('');
            }, 1500);

        } catch (error: any) {
            console.error('❌ Error en registro:', error);
            
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
                <Text style={styles.header}>Registrar Mascota</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>
                        Nombre <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Nombre de tu mascota"
                        style={styles.input}
                        returnKeyType="next"
                        editable={!loading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>
                        Especie <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        value={especie}
                        onChangeText={setEspecie}
                        placeholder="Perro, Gato, Ave, etc."
                        style={styles.input}
                        returnKeyType="next"
                        editable={!loading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Raza (Opcional)</Text>
                    <TextInput
                        value={raza}
                        onChangeText={setRaza}
                        placeholder="Labrador, Siamés, etc."
                        style={styles.input}
                        returnKeyType="next"
                        editable={!loading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Fecha de Nacimiento (Opcional)</Text>
                    <TextInput
                        value={fechaNacimiento}
                        onChangeText={setFechaNacimiento}
                        placeholder="DD/MM/YYYY o YYYY-MM-DD"
                        style={styles.input}
                        returnKeyType="next"
                        editable={!loading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Peso en kg (Opcional)</Text>
                    <TextInput
                        value={peso}
                        onChangeText={setPeso}
                        placeholder="Ej: 15.5"
                        style={styles.input}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleRegisterPet}
                    style={[styles.submit, loading && styles.submitDisabled]}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitText}>
                        {loading ? 'Registrando...' : 'Registrar Mascota'}
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
        fontWeight: '600',
    },
    required: {
        color: '#EF5350',
        fontWeight: '700',
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