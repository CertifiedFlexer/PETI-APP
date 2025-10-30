import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { AuthProvider, useAuth } from "../src/context/AuthContext";
import ProfileStackNavigator from "../src/navigation/ProfileStackNavigator";
import HomeScreen from "../src/screens/HomeScreen";
import LoginScreen from "../src/screens/LoginScreen";
import RegisterPets from "../src/screens/RegisterPets";
import RegisterProveedor from "../src/screens/RegisterProveedor";

const Tab = createBottomTabNavigator();

function AppContent() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#079DC3" />
        <Text style={{ marginTop: 10 }}>Cargando aplicación...</Text>
      </View>
    );
  }

  if (!token) {
    return <LoginScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "help";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "RegisterPet") {
            iconName = focused ? "paw" : "paw-outline";
          } else if (route.name === "RegisterProveedor") {
            iconName = focused ? "briefcase" : "briefcase-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#073345",
        tabBarInactiveTintColor: "#079DC3",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      <Tab.Screen name="RegisterPet" component={RegisterPets} options={{ title: 'Registrar Mascota' }} />
      <Tab.Screen name="RegisterProveedor" component={RegisterProveedor} options={{ title: 'Registrar Proveedor' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}