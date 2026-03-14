import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CartProvider } from './src/contexts/CartContext';
import { ThemeProvider } from './src/contexts/ThemeContext'; 

import MenuScreen from './src/screens/MenuScreen';
import CartReviewScreen from './src/screens/CartReviewScreen';
import PaymentScreen from './src/screens/PaymentScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CartProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Menu" component={MenuScreen} />
              <Stack.Screen name="CartReview" component={CartReviewScreen} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}