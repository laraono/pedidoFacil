import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";

export default function CartBottomBar() {
  const navigation = useNavigation();
  const { cartItems, cartTotal } = useCart();
  const { theme } = useTheme();

  const styles = useMemo(() => getStyles(theme), [theme]);

  if (cartItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.tableHeader}>
        <Text style={[styles.colLeft, styles.headerText]}>Item</Text>
        <Text style={[styles.colCenter, styles.headerText]}>Qtd</Text>
        <Text style={[styles.colRight, styles.headerText]}>Preço</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.map((item, index) => (
          <View
            key={`${item.id}-${item.size?.name}-${item.observation}-${index}`}
            style={styles.itemRow}
          >
            <View style={styles.colLeft}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemObs} numberOfLines={1}>
                {item.size?.name !== "Padrão" ? `Tam: ${item.size?.name}` : ""}
                {item.observation ? ` | Obs: ${item.observation}` : ""}
              </Text>
            </View>

            <Text style={[styles.colCenter, styles.itemQty]}>
              {item.quantity}x
            </Text>

            <Text style={[styles.colRight, styles.itemPrice]}>
              R${" "}
              {(item.size.price * item.quantity).toFixed(2).replace(".", ",")}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalWrapper}>
          <Text style={styles.totalLabel}>Total do Pedido</Text>
          <Text style={styles.totalValue}>
            R$ {cartTotal.toFixed(2).replace(".", ",")}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.finalizeButton}
          onPress={() => navigation.navigate("CartReview")}
          activeOpacity={0.8}
        >
          <Text style={styles.finalizeButtonText}>Avançar</Text>
          <Feather name="arrow-right" size={20} color={theme.textoBotoes} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.fundoProdutos,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 24,
      maxHeight: 340,
      zIndex: 100,
      elevation: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      borderTopWidth: 1,
      borderColor: theme.borda,
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme.borda,
      paddingBottom: 12,
      marginBottom: 8,
    },
    headerText: {
      color: theme.textoSecundario,
      fontWeight: "900",
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    scrollArea: {
      maxHeight: 140,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.fundoGeral,
    },
    colLeft: { flex: 2, justifyContent: "center", paddingRight: 8 },
    colCenter: { flex: 0.8, textAlign: "center" },
    colRight: { flex: 1.2, textAlign: "right" },
    itemName: {
      color: theme.corTextoPrincipal,
      fontWeight: "800",
      fontSize: 15,
    },
    itemObs: {
      color: theme.textoSecundario,
      fontSize: 12,
      marginTop: 2,
      fontStyle: "italic",
    },
    itemQty: {
      color: theme.corTextoPrincipal,
      fontWeight: "900",
      fontSize: 15,
    },
    itemPrice: {
      color: theme.corBotoes,
      fontWeight: "900",
      fontSize: 15,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.borda,
    },
    totalWrapper: {
      flexDirection: "column",
    },
    totalLabel: {
      color: theme.textoSecundario,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    totalValue: {
      color: theme.corTextoPrincipal,
      fontSize: 26,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    finalizeButton: {
      backgroundColor: theme.corBotoes,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 32,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    finalizeButtonText: {
      color: theme.textoBotoes,
      fontWeight: "900",
      fontSize: 16,
      textTransform: "uppercase",
    },
  });
