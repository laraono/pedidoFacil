import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../contexts/CartContext";
import colors from "../theme/colors";

const PAYMENT_METHODS = [
  { id: "credito", label: "Crédito", icon: "credit-card", color: "#E85D5D" },
  {
    id: "debito",
    label: "Débito",
    icon: "credit-card-outline",
    color: "#4A90E2",
  },
  { id: "pix", label: "Pix", icon: "qrcode", color: "#48B8A6" },
  { id: "dinheiro", label: "Dinheiro", icon: "cash", color: "#4CAF50" },
  { id: "misto", label: "Misto", icon: "swap-horizontal", color: "#829356" },
  {
    id: "cancelar",
    label: "Cancelar Pedido",
    icon: "close-circle",
    color: "#D0021B",
  },
];

export default function PaymentScreen() {
  const navigation = useNavigation();
  const { clearCart } = useCart();

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Aguardando pagamento...");
  const [isApproved, setIsApproved] = useState(false);

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
        ? "Aguardar leitura do QR Code..."
        : "A processar pagamento...",
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER IDÊNTICO */}
        <View style={styles.appHeader}>
          <Text style={styles.appHeaderTitle}>Restaurante Exemplo</Text>
        </View>

        <View style={styles.centerWrapper}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather
                name="arrow-left-circle"
                size={28}
                color={colors.textDark}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.mainTitle}>Métodos de Pagamento</Text>

          {/* GRELHA RESPONSIVA */}
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
                >
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={40}
                    color={method.color}
                    style={styles.methodIcon}
                  />
                  <Text style={styles.methodLabel}>{method.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.brandsContainer}>
            <Text style={styles.brandsTitle}>Bandeiras Aceitas</Text>
            <View style={styles.brandsIconsRow}>
              <FontAwesome5
                name="cc-visa"
                size={32}
                color="#1A1F71"
                style={styles.brandIcon}
              />
              <FontAwesome5
                name="cc-mastercard"
                size={32}
                color="#EB001B"
                style={styles.brandIcon}
              />
              <FontAwesome5
                name="cc-amex"
                size={32}
                color="#2E77BC"
                style={styles.brandIcon}
              />
              <FontAwesome5
                name="cc-paypal"
                size={32}
                color="#003087"
                style={styles.brandIcon}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.btnConfirm,
                !selectedMethod && styles.btnConfirmDisabled,
              ]}
              disabled={!selectedMethod}
              onPress={handleConfirm}
            >
              <Text style={styles.btnConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMethod === "pix" && !isApproved && (
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={100}
                color={colors.textDark}
                style={{ marginBottom: 20 }}
              />
            )}
            {isApproved ? (
              <Feather
                name="check-circle"
                size={60}
                color={colors.success}
                style={{ marginBottom: 20 }}
              />
            ) : (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginBottom: 20 }}
              />
            )}
            <Text style={styles.modalStatusText}>{paymentStatus}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  appHeader: {
    height: 70,
    backgroundColor: "#1e90ff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  appHeaderTitle: { color: "white", fontSize: 22, fontWeight: "900" },
  centerWrapper: { flex: 1, alignSelf: "center", width: "100%", maxWidth: 800 },
  header: { paddingHorizontal: 20, paddingTop: 20, alignItems: "flex-start" },
  backButton: { padding: 5 },
  mainTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textDark,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 15,
  }, 
  methodCard: {
    width: 140,
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F0F8FF",
  },
  methodIcon: { marginBottom: 8 },
  methodLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.textDark,
    textAlign: "center",
  },
  brandsContainer: { alignItems: "center", marginTop: 40, paddingBottom: 20 },
  brandsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 15,
  },
  brandsIconsRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  brandIcon: { marginHorizontal: 10, marginBottom: 10 },
  footer: { paddingHorizontal: 30, paddingBottom: 40, marginTop: 20 },
  btnConfirm: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  btnConfirmDisabled: {
    backgroundColor: "#A0C8F0",
    shadowOpacity: 0,
    elevation: 0,
  },
  btnConfirmText: { color: colors.textLight, fontSize: 20, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    maxWidth: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },
  modalStatusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
    textAlign: "center",
  },
});
