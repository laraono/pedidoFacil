import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { useIdleTimer } from "../hooks/useIdleTimer";
import BrandHeader from "../components/ui/BrandHeader";

import { PAYMENT_METHODS } from "../mocks";

const { width } = Dimensions.get("window");

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartTotal, clearCart } = useCart();
  const { theme } = useTheme();

  const panHandlers = useIdleTimer(120);

  const desconto = route.params?.descontoAplicado || 0;
  const totalComDesconto = Math.max(0, cartTotal - desconto);

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  const styles = useMemo(() => getStyles(theme, width), [theme, width]);

  const handleConfirm = () => {
    if (!selectedMethod) return;

    setIsProcessing(true);

    if (selectedMethod === "dinheiro" || selectedMethod === "misto") {
      setPaymentStatus("Imprimindo ficha para pagamento no caixa...");
      setIsApproved(true);
      setTimeout(() => {
        setIsProcessing(false);
        clearCart();
        navigation.navigate("Welcome");
      }, 3500);
    } else {
      setPaymentStatus(
        selectedMethod === "pix"
          ? "Gerando QR Code Pix..."
          : "Comunicando com a operadora...",
      );

      setTimeout(() => {
        setPaymentStatus("Pagamento Aprovado!");
        setIsApproved(true);
        setTimeout(() => {
          setIsProcessing(false);
          clearCart();
          navigation.navigate("Welcome");
        }, 2000);
      }, 3000);
    }
  };

  const handleCancelOrder = () => {
    clearCart();
    navigation.navigate("Welcome");
  };

  return (
    <SafeAreaView style={styles.safeArea} {...panHandlers}>
      <BrandHeader title="Pagamento" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrapper}>
          <Text style={styles.mainTitle}>Como deseja pagar?</Text>

          <View style={styles.gridContainer}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    isSelected && styles.methodCardSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.iconWrapper,
                      isSelected && styles.iconWrapperSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={method.icon}
                      size={42}
                      color={isSelected ? theme.textoBotoes : method.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.methodLabel,
                      isSelected && styles.methodLabelSelected,
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {(selectedMethod === "dinheiro" || selectedMethod === "misto") && (
            <View style={styles.cashWarning}>
              <Feather name="info" size={20} color={theme.corCategorias} />
              <Text style={styles.cashWarningText}>
                Este pagamento deve ser finalizado no balcão. Gere sua ficha e
                apresente ao atendente.
              </Text>
            </View>
          )}

          <View style={styles.brandsContainer}>
            <Text style={styles.brandsTitle}>
              Aceitamos as principais bandeiras
            </Text>
            <View style={styles.brandsWrapper}>
              <FontAwesome5 name="cc-visa" size={28} color="#1A1F71" />
              <FontAwesome5 name="cc-mastercard" size={28} color="#EB001B" />
              <FontAwesome5 name="cc-amex" size={28} color="#2E77BC" />
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={28}
                color="#48B8A6"
              />
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
          style={[styles.btnConfirm, !selectedMethod && styles.btnDisabled]}
          disabled={!selectedMethod}
          onPress={handleConfirm}
        >
          <Text style={styles.btnConfirmText}>
            {selectedMethod === "dinheiro" || selectedMethod === "misto"
              ? "Gerar Ficha"
              : "Finalizar Pedido"}
          </Text>
          <Feather name="arrow-right" size={20} color={theme.textoBotoes} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCancel} onPress={handleCancelOrder}>
          <Text style={styles.btnCancelText}>Cancelar e Sair</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {isApproved ? (
              <Feather
                name="check-circle"
                size={80}
                color={theme.corCategorias}
                style={styles.modalIcon}
              />
            ) : (
              <ActivityIndicator
                size={80}
                color={theme.corBotoes}
                style={styles.modalIcon}
              />
            )}
            <Text style={styles.modalStatusText}>{paymentStatus}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme, width) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.fundoGeral },
    scrollContent: { flexGrow: 1, paddingBottom: 220 },
    centerWrapper: {
      alignSelf: "center",
      width: "100%",
      maxWidth: 800,
      paddingHorizontal: 24,
      paddingTop: 40,
    },
    mainTitle: {
      fontSize: 26,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
      textAlign: "center",
      marginBottom: 32,
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 16,
    },
    methodCard: {
      width: (width - 48 - 16) / 2,
      maxWidth: 220,
      backgroundColor: theme.fundoProdutos,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.borda,
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
    methodLabel: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
      textAlign: "center",
    },
    methodLabelSelected: { color: theme.textoBotoes },
    cashWarning: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF9EB",
      padding: 16,
      borderRadius: 12,
      marginTop: 32,
      gap: 12,
      borderWidth: 1,
      borderColor: "#FFE5A1",
    },
    cashWarningText: {
      flex: 1,
      color: "#856404",
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 18,
    },
    brandsContainer: { alignItems: "center", marginTop: 48 },
    brandsTitle: {
      fontSize: 11,
      fontWeight: "900",
      color: theme.textoSecundario,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 16,
    },
    brandsWrapper: { flexDirection: "row", gap: 20, opacity: 0.6 },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.fundoProdutos,
      paddingHorizontal: 30,
      paddingTop: 20,
      paddingBottom: 30,
      borderTopWidth: 1,
      borderTopColor: theme.borda,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 20,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    totalLabel: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.textoSecundario,
      textTransform: "uppercase",
    },
    totalValue: {
      fontSize: 32,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
    },
    btnConfirm: {
      flexDirection: "row",
      backgroundColor: theme.corBotoes,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    btnDisabled: { opacity: 0.4 },
    btnConfirmText: {
      color: theme.textoBotoes,
      fontSize: 18,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    btnCancel: { alignSelf: "center", marginTop: 16 },
    btnCancelText: {
      color: "#E53935",
      fontSize: 14,
      fontWeight: "900",
      textTransform: "uppercase",
      textDecorationLine: "underline",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "80%",
      backgroundColor: theme.fundoProdutos,
      borderRadius: 32,
      padding: 40,
      alignItems: "center",
    },
    modalIcon: { marginBottom: 24 },
    modalStatusText: {
      fontSize: 20,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
      textAlign: "center",
    },
  });
