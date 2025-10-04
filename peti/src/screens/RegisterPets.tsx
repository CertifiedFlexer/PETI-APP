import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
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
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const PRIMARY = '#39C7fD';
const INPUT_BG = '#f9f9f9';
const BORDER = '#ccc';
const API_URL = 'http://localhost:3000/api/pets'; // Ajusta según tu API

type RootStackParamList = {
    Main: undefined;
    RegisterPet: { userId?: string } | undefined;
};

type Props = {
    userId?: string; // compatibilidad si se pasa como prop
} & NativeStackScreenProps<RootStackParamList, 'RegisterPet'>;

export default function RegisterPetScreen({ route, navigation, userId: propUserId }: Props) {
    const routeUserId = route?.params?.userId;
    const userId = routeUserId ?? propUserId;
    const [nombre, setNombre] = React.useState('');
    const [especie, setEspecie] = React.useState('');
    const [raza, setRaza] = React.useState('');
    const [fechaNacimiento, setFechaNacimiento] = React.useState('');
    const [peso, setPeso] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const { user } = React.useContext(AuthContext);

    const validate = () => {
        console.log('🔍 Validando campos:');
        console.log('  - Nombre:', nombre, '| Válido:', !!nombre.trim());
        console.log('  - Especie:', especie, '| Válido:', !!especie.trim());
        console.log('  - Raza:', raza, '| Válido:', !!raza.trim());
        console.log('  - Fecha:', fechaNacimiento, '| Válido:', !!fechaNacimiento.trim());
        console.log('  - Peso:', peso, '| Válido:', !!peso.trim());

        if (!nombre.trim()) {
            Alert.alert('Error', 'Por favor ingresa el nombre de tu mascota');
            return false;
        }
        if (!especie.trim()) {
            Alert.alert('Error', 'Por favor ingresa la especie');
            return false;
        }

        return true;
    };

    const handleRegisterPet = async () => {
        console.log('🔵 Iniciando registro de mascota...');
        console.log('user: ', user);
        console.log('Datos:', { nombre, especie, raza, fechaNacimiento, peso });
        
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
                peso: Number(peso) || null,
                id_usuario: user?.userId
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
                throw new Error('Error al registrar mascota');
            }

            // Registro exitoso
            console.log('✅ Registro de mascota exitoso');
            Alert.alert(
                'Éxito',
                'Tu mascota ha sido registrada correctamente',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form
                            setNombre('');
                            setEspecie('');
                            setRaza('');
                            setFechaNacimiento('');
                            setPeso('');
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
                <Text style={styles.header}>Registrar Mascota</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Nombre de tu mascota"
                        style={styles.input}
                        returnKeyType="next"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Especie</Text>
                    <TextInput
                        value={especie}
                        onChangeText={setEspecie}
                        placeholder="Perro, Gato, Ave, etc."
                        style={styles.input}
                        returnKeyType="next"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Raza</Text>
                    <TextInput
                        value={raza}
                        onChangeText={setRaza}
                        placeholder="Labrador, Siamés, etc."
                        style={styles.input}
                        returnKeyType="next"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Fecha de Nacimiento</Text>
                    <TextInput
                        value={fechaNacimiento}
                        onChangeText={setFechaNacimiento}
                        placeholder="DD/MM/YYYY o YYYY-MM-DD"
                        style={styles.input}
                        returnKeyType="next"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Peso (kg)</Text>
                    <TextInput
                        value={peso}
                        onChangeText={setPeso}
                        placeholder="Ej: 15.5"
                        style={styles.input}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleRegisterPet}
                    style={[styles.submit, loading ? { opacity: 0.7 } : {}]}
                    disabled={loading}
                >
                    <Text style={styles.submitText}>
                        {loading ? 'Registrando...' : 'Registrar Mascota'}
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