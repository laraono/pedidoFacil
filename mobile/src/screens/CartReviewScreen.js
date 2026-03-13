import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useCart } from "../contexts/CartContext";
import CartItemRow from "../components/CartItemRow";
import BrandHeader from "../components/ui/BrandHeader";
import ProductModal from "../components/ProductModal";
import colors from "../theme/colors";

export default function CartReviewScreen() {
  const navigation = useNavigation();
  const { cartItems, addToCart, removeFromCart, updateCartItem, cartTotal } =
    useCart();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      addToCart(item, item.size, -1);
    } else {
      removeFromCart(item.id, item.size.name);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  const handleConfirmEdit = (newQuantity, obs) => {
    if (newQuantity === 0) {
      removeFromCart(editingItem.id, editingItem.size.name);
    } else {
      updateCartItem(editingItem.id, editingItem.size.name, newQuantity, obs);
    }
    setEditModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* COMPONENTE REUTILIZÁVEL: CABEÇALHO COM BOTÃO VOLTAR */}
      <BrandHeader title="Restaurante Exemplo" />

      <View style={styles.centerWrapper}>
        <View style={styles.navHeader}>
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
          <Text style={styles.title}>Confira seu pedido</Text>
          <View style={{ width: 28 }} />
        </View>

        <FlatList
          data={cartItems}
          keyExtractor={(item, index) =>
            `${item.id}-${item.size.name}-${index}`
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
          }
          renderItem={({ item }) => (
            <CartItemRow
              item={item}
              onIncrease={() => addToCart(item, item.size, 1)}
              onDecrease={() => handleDecrease(item)}
              onEdit={() => openEditModal(item)} 
            />
          )}
        />

        <View style={styles.bottomSection}>
          <View style={styles.discountCard}>
            <View style={styles.discountLeft}>
              <View style={styles.discountRow}>
                <Feather
                  name="tag"
                  size={16}
                  color={colors.textLight}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.discountTitle}>Cupom de Desconto</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.discountAction}>Adicionar {">"}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.discountRight}>
              <Feather
                name="shopping-bag"
                size={18}
                color={colors.textLight}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.totalText}>
                Total: R${cartTotal.toFixed(2).replace(".", ",")}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.btnContinue}
              onPress={() => navigation.navigate("Menu")}
            >
              <Feather name="arrow-left" size={18} color={colors.textLight} />
              <Text style={styles.btnContinueText}>Continuar comprando</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnPayment,
                cartItems.length === 0 && { opacity: 0.5 },
              ]}
              disabled={cartItems.length === 0}
              onPress={() => navigation.navigate("Payment")}
            >
              <Text style={styles.btnPaymentText}>Ir para o pagamento</Text>
              <Feather name="arrow-right" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ProductModal
        visible={editModalVisible}
        product={editingItem}
        cartItem={editingItem} 
        onClose={() => setEditModalVisible(false)}
        onConfirm={handleConfirmEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centerWrapper: { flex: 1, alignSelf: "center", width: "100%", maxWidth: 800 },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: { padding: 5 },
  title: { fontSize: 22, fontWeight: "bold", color: colors.textDark },
  listContent: { paddingBottom: 20 },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#999",
    fontWeight: "bold",
  },
  bottomSection: {
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderColor: "#EEEEEE",
  },
  discountCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  discountLeft: { justifyContent: "space-between" },
  discountRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  discountTitle: { color: colors.textLight, fontWeight: "bold", fontSize: 16 },
  discountAction: { color: colors.textLight, fontSize: 14 },
  discountRight: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginLeft: 10,
  },
  totalText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "bold",
    flexShrink: 1,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  btnContinue: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  btnContinueText: {
    color: colors.textLight,
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 6,
    textAlign: "center",
  },
  btnPayment: {
    flexDirection: "row",
    backgroundColor: colors.success,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  btnPaymentText: {
    color: colors.textLight,
    fontWeight: "bold",
    fontSize: 13,
    marginRight: 6,
    textAlign: "center",
  },
});
