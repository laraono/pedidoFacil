import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import BrandHeader from "../components/ui/BrandHeader";

const PAYMENT_METHODS = [
  { id: "credito", label: "Crédito", icon: "credit-card", color: "#E85D5D" },
  { id: "debito", label: "Débito", icon: "credit-card-outline", color: "#4A90E2" },
  { id: "pix", label: "Pix", icon: "qrcode", color: "#48B8A6" },
  { id: "dinheiro", label: "Dinheiro", icon: "cash", color: "#4CAF50" },
  { id: "misto", label: "Misto", icon: "swap-horizontal", color: "#829356" },
  { id: "cancelar", label: "Cancelar", icon: "close-circle", color: "#D0021B" },
];

export default function PaymentScreen() {
  const navigation = useNavigation();
  const { clearCart } = useCart();
  const { theme } = useTheme();

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Processando...");
  const [isApproved, setIsApproved] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const handleConfirm = () => {
    if (!selectedMethod) return;
    if (selectedMethod === "cancelar") {
      clearCart();
      navigation.navigate("Menu");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus(
      selectedMethod === "pix"
        ? "Aguardando pagamento Pix..."
        : "Autorizando pagamento..."
    );
    setIsApproved(false);

    setTimeout(() => {
      setPaymentStatus("Pagamento Aprovado!");
      setIsApproved(true);
      setTimeout(() => {
        setIsProcessing(false);
        clearCart();
        navigation.navigate("Menu");
      }, 1500);
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader title="Pagamento" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrapper}>
          <Text
            style={styles.mainTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Selecione a forma de pagamento
          </Text>

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
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconWrapper,
                      isSelected && styles.iconWrapperSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={method.icon}
                      size={48}
                      color={isSelected ? theme.textoBotoes : method.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.methodLabel,
                      isSelected && styles.methodLabelSelected,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.brandsContainer}>
            <Text style={styles.brandsTitle}>Aceitamos</Text>
            <View style={styles.brandsWrapper}>
              <FontAwesome5 name="cc-visa" size={32} color="#1A1F71" />
              <FontAwesome5 name="cc-mastercard" size={32} color="#EB001B" />
              <FontAwesome5 name="cc-amex" size={32} color="#2E77BC" />
              <FontAwesome5 name="cc-paypal" size={32} color="#003087" />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedFooter}>
        <TouchableOpacity
          style={[
            styles.btnConfirm,
            !selectedMethod && styles.btnConfirmDisabled,
          ]}
          disabled={!selectedMethod}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.btnConfirmText,
              !selectedMethod && styles.btnConfirmTextDisabled,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Confirmar Pagamento
          </Text>
          <Feather
            name="check-circle"
            size={20}
            color={!selectedMethod ? theme.textoSecundario : theme.textoBotoes}
            style={styles.btnIcon}
          />
        </TouchableOpacity>
      </View>

      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMethod === "pix" && !isApproved ? (
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={120}
                color={theme.corBotoes}
                style={styles.modalIcon}
              />
            ) : null}

            {isApproved ? (
              <Feather
                name="check-circle"
                size={100}
                color={theme.corBotoes}
                style={styles.modalIcon}
              />
            ) : selectedMethod !== "pix" ? (
              <ActivityIndicator
                size={100}
                color={theme.corBotoes}
                style={styles.modalIcon}
              />
            ) : null}
            <Text style={styles.modalStatusText} numberOfLines={2} adjustsFontSizeToFit>
              {paymentStatus}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.fundoGeral,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  centerWrapper: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 900,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.corTextoPrincipal,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40,
    letterSpacing: -0.5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  methodCard: {
    width: "45%",
    maxWidth: 220,
    aspectRatio: 1.2,
    backgroundColor: theme.fundoProdutos,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.borda,
    padding: 15,
  },
  methodCardSelected: {
    borderColor: theme.corBotoes,
    backgroundColor: theme.corBotoes,
    transform: [{ scale: 1.02 }],
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.fundoGeral,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconWrapperSelected: {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  methodLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.corTextoPrincipal,
    textAlign: "center",
    width: "100%",
  },
  methodLabelSelected: {
    color: theme.textoBotoes,
  },
  brandsContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingBottom: 20,
  },
  brandsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textoSecundario,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 20,
  },
  brandsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 24,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.fundoGeral,
    paddingHorizontal: 30,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: theme.borda,
    alignItems: "center",
  },
  btnConfirm: {
    flexDirection: "row",
    backgroundColor: theme.corBotoes,
    width: "100%",
    maxWidth: 600,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  btnConfirmDisabled: {
    backgroundColor: theme.fundoProdutos,
    borderWidth: 1,
    borderColor: theme.borda,
  },
  btnConfirmText: {
    color: theme.textoBotoes,
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  btnConfirmTextDisabled: {
    color: theme.textoSecundario,
  },
  btnIcon: {
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: theme.fundoProdutos,
    borderRadius: 32,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.borda,
  },
  modalIcon: {
    marginBottom: 32,
  },
  modalStatusText: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.corTextoPrincipal,
    textAlign: "center",
    lineHeight: 32,
  },
});