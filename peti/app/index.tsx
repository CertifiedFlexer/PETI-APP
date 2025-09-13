import React from "react";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import LoginScreen from "../src/screens/LoginScreen";
import HomeScreen from "../src/screens/HomeScreen";
import { ActivityIndicator, View, Text } from "react-native";

function AppContent() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Cargando aplicación...</Text>
      </View>
    );
  }

  return token ? <HomeScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}