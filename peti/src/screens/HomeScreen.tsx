// src/screens/HomeScreen.tsx
import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY = '#39C7fD';

const options = [
  { key: 'stores', label: 'Tiendas', icon: 'cart', color: '#FF6B9D', bg: '#FFF0F5' },
  { key: 'vets', label: 'Veterinarias', icon: 'medical', color: '#4CAF50', bg: '#F1F8F4' },
  { key: 'groomers', label: 'Peluquerías', icon: 'cut', color: '#FF9800', bg: '#FFF8F0' },
  { key: 'walkers', label: 'Paseadores', icon: 'walk', color: '#2196F3', bg: '#F0F7FF' },
  { key: 'insurance', label: 'Seguros', icon: 'shield-checkmark', color: '#9C27B0', bg: '#F8F0FF' },
];

export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext);

  const onSelect = (label: string) => {
    Alert.alert(label, `Mostrar lista de ${label}`);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header mejorado */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>Hola 👋</Text>
          <Text style={styles.welcome}>{user?.name || 'Usuario'}</Text>
        </View>
        <TouchableOpacity onPress={logout} activeOpacity={0.7}>
          <View style={styles.logoutIconWrap}>
            <Ionicons name="log-out-outline" size={22} color={PRIMARY} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Subtitle con decoración */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>¿En qué podemos ayudarte hoy?</Text>
        <View style={styles.decorativeLine} />
      </View>

      {/* Grid mejorado */}
      <View style={styles.grid}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={styles.cardWrapper}
            activeOpacity={0.85}
            onPress={() => onSelect(opt.label)}
          >
            <View style={[styles.card, { backgroundColor: opt.bg }]}>
              <View style={[styles.iconWrap, { backgroundColor: opt.color }]}>
                <Ionicons name={opt.icon as any} size={32} color="#fff" />
              </View>
              <Text style={styles.cardLabel}>{opt.label}</Text>
              <View style={[styles.cardArrow, { backgroundColor: opt.color + '20' }]}>
                <Ionicons name="arrow-forward" size={16} color={opt.color} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Decoración inferior */}
      <View style={styles.bottomDecor}>
        <Text style={styles.bottomText}>Cuidando de tu mascota 🐾</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#F8F9FD', 
    paddingTop: 50,
  },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  welcome: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  logoutIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E8F4FD',
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  subtitle: { 
    color: '#4A5568', 
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  decorativeLine: {
    width: 40,
    height: 3,
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 12,
  },
  cardWrapper: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 140,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardLabel: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#2D3748',
    textAlign: 'center',
    marginTop: 4,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomDecor: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
});