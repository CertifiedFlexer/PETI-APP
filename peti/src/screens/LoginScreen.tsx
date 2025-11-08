import React, { useState } from "react";
import { View, Image, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import RegisterScreen from "./RegisterScreen";

const PRIMARY = '#39C7fD';

export default function LoginScreen() {
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al iniciar sesión");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Cargando...</Text>
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
      <Image source={require("../assets/images/logo.jpeg")} style={styles.logo} resizeMode="contain"/>
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />

      <View style={{ borderRadius: 10, overflow: "hidden", width: '100%' }}>
        <Button 
          title={isLoggingIn ? "Iniciando sesión..." : "Iniciar Sesión"} 
          onPress={handleLogin} 
          color={PRIMARY}
          disabled={isLoggingIn || isLoading}
        />
      </View>

      <TouchableOpacity onPress={() => setShowRegister(true)} style={styles.registerLink}>
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
  registerLink: {
    marginTop: 16,
  },
  registerText: {
    color: PRIMARY,
    fontWeight: '600',
  }
});