import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { useIdleTimer } from "../hooks/useIdleTimer";
import BrandHeader from "../components/ui/BrandHeader";

import { submitOrder } from "../services/orderService";
import { connectMobileSocket } from "../services/socketService";

import { appConfig } from "../services/apiConfig";

const { width } = Dimensions.get("window");

const PAYMENT_ICONS = {
  "PIX": { icon: "qrcode-scan", label: "Pix", color: "#32BCAD" },
  "Dinheiro": { icon: "cash-multiple", label: "Dinheiro", color: "#4CAF50" },
  "Cartão Crédito": { icon: "credit-card", label: "Crédito", color: "#1976D2" },
  "Cartão Débito": { icon: "credit-card-outline", label: "Débito", color: "#FF9800" },
  "MISTO": { icon: "wallet", label: "Pagar no Caixa", color: "#9C27B0" }
};

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { theme } = useTheme();

  const panHandlers = useIdleTimer(120);

  const desconto = route.params?.descontoAplicado || 0;
  const customerName = route.params?.customerName || null;
  const totalComDesconto = Math.max(0, cartTotal - desconto);

  const [availableMethods, setAvailableMethods] = useState([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEstablishmentData = useCallback(async () => {
    try {
      const url = `${appConfig.API_URL}/estabelecimento/${appConfig.ESTABLISHMENT_ID}/public`;
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-totem-code': appConfig.selfServiceCode 
        }
      });
      
      if (response.ok) {
        const data = await response.json();        
        let methods = typeof data.paymentMethods === "string"
          ? JSON.parse(data.paymentMethods)
          : data.paymentMethods || [];
        
        if (methods.length === 0) methods = ["MISTO"];
        
        setAvailableMethods(methods);
      } else {
        setAvailableMethods(["MISTO"]);
      }
    } catch (error) {
      setAvailableMethods(["MISTO"]);
    } finally {
      setIsLoadingMethods(false);
    }
  }, []);

  useEffect(() => {
    loadEstablishmentData();
    const socket = connectMobileSocket();

    socket.on("profile_updated", () => {
      setSelectedMethod(null);
      loadEstablishmentData(); 
    });

    return () => {
      socket.off("profile_updated");
    };
  }, [loadEstablishmentData]);

  const styles = useMemo(() => getStyles(theme, width), [theme, width]);

  const handleConfirm = async () => {
    if (!selectedMethod || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const orderData = await submitOrder({ cartItems, customerName });

      if (selectedMethod === "Dinheiro" || selectedMethod === "MISTO") {
        clearCart();
        navigation.navigate("OrderConfirmed", {
          ticket: orderData.ticket,
          label: orderData.label,
        });
      } else {
        navigation.navigate("MPBricks", {
          amount: totalComDesconto,
          method: selectedMethod,
          orderId: orderData.id,
        });
      }
    } catch (error) {
      console.error("[PaymentScreen] Erro:", error);
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = () => {
    clearCart();
    navigation.navigate("Welcome");
  };

  if (isLoadingMethods) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
         <ActivityIndicator size="large" color={theme.corBotoes} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} {...panHandlers}>
      <BrandHeader title="Pagamento" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.centerWrapper}>
          <Text style={styles.mainTitle}>Como deseja pagar?</Text>

          <View style={styles.gridContainer}>
            {availableMethods.map((methodKey) => {
              const methodInfo = PAYMENT_ICONS[methodKey] || { icon: "credit-card", label: methodKey, color: "#888" };
              const isSelected = selectedMethod === methodKey;
              
              return (
                <TouchableOpacity
                  key={methodKey}
                  style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                  onPress={() => setSelectedMethod(methodKey)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
                    <MaterialCommunityIcons
                      name={methodInfo.icon}
                      size={42}
                      color={isSelected ? theme.textoBotoes : methodInfo.color}
                    />
                  </View>
                  <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>
                    {methodInfo.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {(selectedMethod === "Dinheiro" || selectedMethod === "MISTO") && (
            <View style={styles.cashWarning}>
              <Feather name="info" size={20} color={theme.corCategorias} />
              <Text style={styles.cashWarningText}>
                Este pagamento deve ser finalizado no balcão. Gere sua ficha e apresente ao atendente.
              </Text>
            </View>
          )}

          <View style={styles.brandsContainer}>
            <Text style={styles.brandsTitle}>Aceitamos as principais bandeiras</Text>
            <View style={styles.brandsWrapper}>
              <FontAwesome5 name="cc-visa" size={28} color="#1A1F71" />
              <FontAwesome5 name="cc-mastercard" size={28} color="#EB001B" />
              <FontAwesome5 name="cc-amex" size={28} color="#2E77BC" />
              <MaterialCommunityIcons name="qrcode-scan" size={28} color="#48B8A6" />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total a Pagar</Text>
          <Text style={styles.totalValue}>
            R$ {totalComDesconto.toFixed(2).replace(".", ",")}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btnConfirm, (!selectedMethod || isSubmitting) && styles.btnDisabled]}
          disabled={!selectedMethod || isSubmitting}
          onPress={handleConfirm}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.textoBotoes} />
          ) : (
            <>
              <Text style={styles.btnConfirmText}>
                {selectedMethod === "Dinheiro" || selectedMethod === "MISTO" ? "Gerar Ficha" : "Finalizar Pedido"}
              </Text>
              <Feather name="arrow-right" size={20} color={theme.textoBotoes} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCancel} onPress={handleCancelOrder}>
          <Text style={styles.btnCancelText}>Cancelar e Sair</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const getStyles = (theme, width) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.fundoGeral },
    scrollContent: { flexGrow: 1, paddingBottom: 220 },
    centerWrapper: { alignSelf: "center", width: "100%", maxWidth: 800, paddingHorizontal: 24, paddingTop: 40 },
    mainTitle: { fontSize: 26, fontWeight: "900", color: theme.corTextoPrincipal, textAlign: "center", marginBottom: 32 },
    gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16 },
    methodCard: {
      width: (width - 48 - 16) / 2,
      maxWidth: 220,
      backgroundColor: theme.fundoProdutos,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      elevation: 5,
      paddingVertical: 24,
      paddingHorizontal: 12,
      minHeight: 140,
    },
    methodCardSelected: {
      borderColor: theme.corBotoes,
      backgroundColor: theme.corBotoes,
    },
    iconWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.fundoGeral, 
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    iconWrapperSelected: { backgroundColor: "rgba(255,255,255,0.2)" },
    methodLabel: { fontSize: 18, fontWeight: "900", color: theme.corTextoPrincipal, textAlign: "center" },
    methodLabelSelected: { color: theme.textoBotoes },
    cashWarning: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF9EB", padding: 16, borderRadius: 12, marginTop: 32, gap: 12, borderWidth: 1, borderColor: "#FFE5A1" },
    cashWarningText: { flex: 1, color: "#856404", fontSize: 13, fontWeight: "700", lineHeight: 18 },
    brandsContainer: { alignItems: "center", marginTop: 48 },
    brandsTitle: { fontSize: 11, fontWeight: "900", color: theme.textoSecundario, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
    brandsWrapper: { flexDirection: "row", gap: 20, opacity: 0.6 },
    footer: {
      position: "absolute",
      bottom: 0, left: 0, right: 0,
      backgroundColor: theme.fundoProdutos,
      paddingHorizontal: 30, paddingTop: 20, paddingBottom: 30,
      borderTopWidth: 0.5,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
      elevation: 20,
    },
    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    totalLabel: { fontSize: 14, fontWeight: "900", color: theme.textoSecundario, textTransform: "uppercase" },
    totalValue: { fontSize: 32, fontWeight: "900", color: theme.corTextoPrincipal },
    btnConfirm: { flexDirection: "row", backgroundColor: theme.corBotoes, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", gap: 12 },
    btnDisabled: { opacity: 0.4 },
    btnConfirmText: { color: theme.textoBotoes, fontSize: 18, fontWeight: "900", textTransform: "uppercase" },
    btnCancel: { alignSelf: "center", marginTop: 16 },
    btnCancelText: { color: "#E53935", fontSize: 14, fontWeight: "900", textTransform: "uppercase", textDecorationLine: "underline" },
  });