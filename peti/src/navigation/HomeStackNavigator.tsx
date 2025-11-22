import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Store } from "../api/stores";
import GroomersScreen from "../screens/GroomersScreen";
import HomeScreen from "../screens/HomeScreen";
import InsuranceScreen from "../screens/InsuranceScreen";
import MyStoresScreen from "../screens/MyStoresScreen";
import RegisterPetScreen from "../screens/RegisterPets";
import RegisterProveedorScreen from "../screens/RegisterProveedor";
import StoreDetailScreen from "../screens/StoreDetailScreen";
import StoresScreen from "../screens/StoresScreen";
import VetsScreen from "../screens/VetsScreen";
import WalkersScreen from "../screens/WalkersScreen";

export type HomeStackParamList = {
    HomeMain: undefined;
    RegisterPet: { userId?: string };
    RegisterProveedor: undefined;
    Stores: undefined;
    Vets: undefined;
    Groomers: undefined;
    Walkers: undefined;
    Insurance: undefined;
    MyStores: undefined;
    StoreDetail: { store: Store };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="RegisterPet" component={RegisterPetScreen} />
            <Stack.Screen name="RegisterProveedor" component={RegisterProveedorScreen} />
            <Stack.Screen name="Stores" component={StoresScreen} />
            <Stack.Screen name="Vets" component={VetsScreen} />
            <Stack.Screen name="Groomers" component={GroomersScreen} />
            <Stack.Screen name="Walkers" component={WalkersScreen} />
            <Stack.Screen name="Insurance" component={InsuranceScreen} />
            <Stack.Screen name="MyStores" component={MyStoresScreen} />
            <Stack.Screen name="StoreDetail" component={StoreDetailScreen} />
        </Stack.Navigator>
    );
}