import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

const PRIMARY = '#3AC7FD';

const options = [
  { key: 'stores', label: 'Tiendas', icon: 'cart', color: PRIMARY, bg: '#F1F8F4', navigateTo: 'Stores' },
  { key: 'vets', label: 'Veterinarias', icon: 'medical', color: PRIMARY, bg: '#F1F8F4', navigateTo: 'Vets' },
  { key: 'groomers', label: 'Peluquerías', icon: 'cut', color: PRIMARY, bg: '#F1F8F4', navigateTo: 'Groomers' },
  { key: 'walkers', label: 'Paseadores', icon: 'walk', color: PRIMARY, bg: '#F1F8F4', navigateTo: 'Walkers' },
  { key: 'insurance', label: 'Seguros', icon: 'shield-checkmark', color: PRIMARY, bg: '#F1F8F4', navigateTo: 'Insurance' },
  { key: 'RegisterProveedor', label: 'Registrar Proveedor', icon: 'briefcase', color: PRIMARY, bg: '#F1F8F4', navigateTo: 'RegisterProveedor' },
  { key: 'RegisterPet', label: 'Registrar Mascota', icon: 'paw', color: PRIMARY, bg: '#F1F8F4', navigateTo: 'RegisterPet' },
];

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.');
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greeting}>Hola 👋</Text>
            <Text style={styles.welcome}>{user?.name || 'Usuario'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.logoutIconWrap}>
              <Ionicons name="log-out-outline" size={22} color={PRIMARY} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>¿En qué podemos ayudarte hoy?</Text>
          <View style={styles.decorativeLine} />
        </View>

        <View style={styles.grid}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.cardWrapper}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(opt.navigateTo)}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#F8F9FD',
  },
  scrollContent: {
    paddingTop: 50,
    paddingBottom: 80,
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
});