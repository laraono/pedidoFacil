import React, { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CartProvider } from "./src/contexts/CartContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";

import MenuScreen from "./src/screens/MenuScreen";
import CartReviewScreen from "./src/screens/CartReviewScreen";
import NameInputScreen from "./src/screens/NameInputScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import MPBricksScreen from "./src/screens/MPBricksScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import ConfigScreen from "./src/screens/ConfigScreen";
import OrderConfirmedScreen from "./src/screens/OrderConfirmedScreen";

import { loadAppConfig } from "./src/services/apiConfig";
import { connectMobileSocket } from "./src/services/socketService";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const configured = await loadAppConfig();
        setIsConfigured(configured);
      } catch (error) {
        console.error("Erro na inicialização:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isConfigured) return;
    const socket = connectMobileSocket();
    socket.on("self_service_disabled", () => {
      setIsConfigured(false);
    });
    return () => {
      socket.off("self_service_disabled");
    };
  }, [isConfigured]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CartProvider>
          {!isConfigured ? (
            <ConfigScreen onFinishConfig={() => setIsConfigured(true)} />
          ) : (
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Menu" component={MenuScreen} />
                <Stack.Screen name="CartReview" component={CartReviewScreen} />
                <Stack.Screen name="NameInput" component={NameInputScreen} />
                <Stack.Screen name="Payment" component={PaymentScreen} />
                <Stack.Screen name="MPBricks" component={MPBricksScreen} />
                <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          )}
        </CartProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}