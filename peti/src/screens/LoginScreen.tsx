import React, { useState } from "react";
import { ActivityIndicator, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import RegisterScreen from "./RegisterScreen";

const PRIMARY = '#39C7fD';

export default function LoginScreen() {
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, isLoading } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const handleLogin = async () => {
    // Validación de campos vacíos
    if (!email && !password) {
      showWarning("Por favor ingresa tu email y contraseña");
      return;
    }

    if (!email) {
      showWarning("Por favor ingresa tu email");
      return;
    }

    if (!password) {
      showWarning("Por favor ingresa tu contraseña");
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("El formato del email es inválido");
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(email, password);
      showSuccess("Inicio de sesión exitoso");
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Manejo específico de errores
      if (error.message === "Credenciales inválidas") {
        showError("Email o contraseña incorrectos");
      } else if (error.message && error.message.includes("network")) {
        showError("Error de conexión. Verifica tu internet");
      } else {
        showError(error.message || "Error al iniciar sesión. Intenta de nuevo");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Cargando aplicación...</Text>
      </View>
    );
  }

  if (showRegister) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ padding: 12, backgroundColor: '#fff' }}>
          <TouchableOpacity onPress={() => setShowRegister(false)}>
            <Text style={{ color: PRIMARY, fontWeight: '600' }}>{'<'} Volver</Text>
          </TouchableOpacity>
        </View>
        <RegisterScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image 
        source={require("../assets/images/logo.jpeg")} 
        style={styles.logo} 
        resizeMode="contain"
      />
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        editable={!isLoggingIn}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        editable={!isLoggingIn}
      />
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isLoggingIn ? "Iniciando sesión..." : "Iniciar Sesión"} 
          onPress={handleLogin} 
          color={PRIMARY}
          disabled={isLoggingIn || isLoading}
        />
      </View>

      <TouchableOpacity 
        onPress={() => setShowRegister(true)} 
        style={styles.registerLink}
        disabled={isLoggingIn}
      >
        <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20,
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 10, 
    color: "#000",
    fontWeight: "bold"
  },
  input: { 
    width: "100%", 
    height: 50, 
    borderColor: "#ccc", 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    marginBottom: 15,
    backgroundColor: "#f9f9f9"
  },
  logo: {
    width: 50,
    height: 100,
    marginBottom: 20
  },
  buttonContainer: { 
    borderRadius: 10, 
    overflow: "hidden", 
    width: '100%' 
  },
  registerLink: {
    marginTop: 16,
  },
  registerText: {
    color: PRIMARY,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  }
});