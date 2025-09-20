// src/screens/HomeScreen.tsx
import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido {user?.name || "Usuario"}</Text>
      <View style={{ borderRadius: 20, overflow: "hidden" }}>
      <Button color="#39C7fD" title="Cerrar sesión" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, marginBottom: 20, color: "#000" }
});
