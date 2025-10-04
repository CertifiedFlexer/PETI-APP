import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import HomeScreen from "../screens/HomeScreen";
import RegisterPetScreen from "../screens/RegisterPets";

export type HomeStackParamList = {
    HomeMain: undefined;
    RegisterPet: { userId?: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="RegisterPet" component={RegisterPetScreen} />
        </Stack.Navigator>
    );
}
