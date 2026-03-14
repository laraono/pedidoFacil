import React, { useState, useMemo } from "react";
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
import { useTheme } from "../contexts/ThemeContext";
import CartItemRow from "../components/CartItemRow";
import BrandHeader from "../components/ui/BrandHeader";
import ProductModal from "../components/ProductModal";

export default function CartReviewScreen() {
  const navigation = useNavigation();
  const { cartItems, addToCart, removeFromCart, updateCartItem, cartTotal } = useCart();
  const { theme } = useTheme();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const styles = useMemo(() => getStyles(theme), [theme]);

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
      <BrandHeader title="Revisão do Pedido" showBack={false} />

      <View style={styles.centerWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={28} color={theme.corTextoPrincipal} />
          </TouchableOpacity>
          <Text style={styles.pageTitle} numberOfLines={1} adjustsFontSizeToFit>
            Seus Itens
          </Text>
          <View style={styles.spacer} />
        </View>

        <FlatList
          data={cartItems}
          keyExtractor={(item, index) => `${item.id}-${item.size.name}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="shopping-cart" size={48} color={theme.textoSecundario} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
            </View>
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

        {cartItems.length > 0 ? (
          <View style={styles.bottomPanel}>
            <TouchableOpacity style={styles.couponCard} activeOpacity={0.8}>
              <View style={styles.couponLeft}>
                <Feather name="tag" size={20} color={theme.categoriaAtiva} />
                <Text style={styles.couponText}>Adicionar cupom de desconto</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textoSecundario} />
            </TouchableOpacity>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={styles.totalValue} numberOfLines={1} adjustsFontSizeToFit>
                R$ {cartTotal.toFixed(2).replace(".", ",")}
              </Text>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => navigation.navigate("Menu")}
                activeOpacity={0.8}
              >
                <Text style={styles.btnSecondaryText} numberOfLines={1} adjustsFontSizeToFit>
                  Adicionar Mais
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => navigation.navigate("Payment")}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryText} numberOfLines={1} adjustsFontSizeToFit>
                  Avançar
                </Text>
                <Feather name="arrow-right" size={20} color={theme.textoBotoes} style={styles.btnIcon} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
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

const getStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.fundoGeral,
  },
  centerWrapper: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 900,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.fundoProdutos,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.borda,
  },
  pageTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
    color: theme.corTextoPrincipal,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  spacer: {
    width: 48,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    color: theme.textoSecundario,
    fontWeight: "600",
  },
  bottomPanel: {
    backgroundColor: theme.fundoGeral,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: theme.borda,
  },
  couponCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.fundoProdutos,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.borda,
    borderStyle: "dashed",
    marginBottom: 24,
  },
  couponLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  couponText: {
    color: theme.categoriaAtiva,
    fontSize: 16,
    fontWeight: "700",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  totalLabel: {
    fontSize: 18,
    color: theme.textoSecundario,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: "900",
    color: theme.corBotoes,
    flexShrink: 1,
    paddingLeft: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  btnSecondary: {
    flex: 1,
    height: 60,
    backgroundColor: theme.fundoProdutos,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.borda,
    paddingHorizontal: 16,
  },
  btnSecondaryText: {
    color: theme.corTextoPrincipal,
    fontSize: 16,
    fontWeight: "700",
  },
  btnPrimary: {
    flex: 1.5,
    flexDirection: "row",
    height: 60,
    backgroundColor: theme.corBotoes,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  btnPrimaryText: {
    color: theme.textoBotoes,
    fontSize: 18,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  btnIcon: {
    marginLeft: 8,
  },
});