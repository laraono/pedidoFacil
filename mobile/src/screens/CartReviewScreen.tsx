import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useCart } from "../contexts/CartContext";
import type { CartItem } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import CartItemRow from "../components/CartItemRow";
import BrandHeader from "../components/ui/BrandHeader";
import ProductModal from "../components/ProductModal";

import { appConfig } from "../services/apiConfig";

export default function CartReviewScreen() {
  const navigation = useNavigation<any>();
  const { cartItems, addToCart, removeFromCart, updateCartItem, cartTotal } = useCart();
  const { theme } = useTheme();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  const [cupomInput, setCupomInput] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  const styles = useMemo(() => getStyles(theme), [theme]);

  const totalComDesconto = Math.max(0, cartTotal - desconto);

  const handleApplyCupom = async () => {
    if (!cupomInput.trim()) {
      setDesconto(0);
      setCouponMessage("");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage("");

    try {
      const response = await fetch(
        `${appConfig.API_URL}/cupons/validate/${cupomInput.trim()}?establishmentId=${appConfig.ESTABLISHMENT_ID}`,
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setDesconto(0);
        setCouponMessage(errData.error || "Cupom inválido ou expirado.");
        setIsApplyingCoupon(false);
        return;
      }

      const found = await response.json();
      const valorDesconto = found.type === "Percentual" ? cartTotal * (found.value / 100) : found.value;
      setDesconto(valorDesconto);
      setCouponMessage("");
    } catch (error) {
      console.error("Erro ao validar cupom:", error);
      setDesconto(0);
      setCouponMessage("Erro de conexão ao validar cupom.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity > 1) {
      addToCart(item, item.size, -1);
    } else {
      removeFromCart(item.id, item.size.name);
    }
  };

  const openEditModal = (item: CartItem) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  const handleConfirmEdit = (newQuantity: number, obs: string) => {
    if (!editingItem) return;
    if (newQuantity === 0) {
      removeFromCart(editingItem.id, editingItem.size.name);
    } else {
      updateCartItem(editingItem.id, editingItem.size.name, newQuantity, obs);
    }
    setEditModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader showBack={true} />

      <View style={styles.centerWrapper}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle} numberOfLines={1} adjustsFontSizeToFit>
            Seus Itens
          </Text>
        </View>

        <FlatList
          data={cartItems}
          keyExtractor={(item, index) => `${item.id}-${item.size?.name || "unico"}-${index}`}
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

        {cartItems.length > 0 && (
          <View style={styles.bottomPanel}>
            <View style={styles.cupomSection}>
              <View style={styles.cupomRow}>
                <View style={styles.inputWrapper}>
                  <Feather name="tag" size={18} color={theme.textoSecundario} />
                  <TextInput
                    style={styles.input}
                    placeholder="Cupom"
                    placeholderTextColor={theme.textoSecundario}
                    value={cupomInput}
                    onChangeText={(text) => {
                      setCupomInput(text);
                      if (desconto > 0) setDesconto(0);
                    }}
                    autoCapitalize="characters"
                  />
                </View>
                <TouchableOpacity style={[styles.btnApply, isApplyingCoupon && { opacity: 0.7 }]} onPress={handleApplyCupom} activeOpacity={0.8} disabled={isApplyingCoupon}>
                  <Text style={styles.btnApplyText}>{isApplyingCoupon ? "..." : "Aplicar"}</Text>
                </TouchableOpacity>
              </View>
              {desconto > 0 && (
                <Text style={styles.discountMsg}>Desconto de R$ {desconto.toFixed(2).replace(".", ",")} aplicado!</Text>
              )}
              {couponMessage ? <Text style={styles.errorMsg}>{couponMessage}</Text> : null}
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total do Pedido</Text>
              <Text style={styles.totalValue} numberOfLines={1} adjustsFontSizeToFit>
                R$ {totalComDesconto.toFixed(2).replace(".", ",")}
              </Text>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate("Menu")} activeOpacity={0.8}>
                <Text style={styles.btnSecondaryText} numberOfLines={1} adjustsFontSizeToFit>Adicionar Mais</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate("NameInput", { descontoAplicado: desconto })} activeOpacity={0.8}>
                <Text style={styles.btnPrimaryText} numberOfLines={1} adjustsFontSizeToFit>Pagar</Text>
                <Feather name="arrow-right" size={20} color={theme.textoBotoes} style={styles.btnIcon} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <ProductModal
        visible={editModalVisible}
        product={editingItem}
        onClose={() => setEditModalVisible(false)}
        onConfirm={handleConfirmEdit}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.fundoGeral },
    centerWrapper: { flex: 1, alignSelf: "center", width: "100%", maxWidth: 900 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 32, paddingBottom: 16 },
    pageTitle: { fontSize: 28, fontWeight: "900", color: theme.corTextoPrincipal, textAlign: "center", letterSpacing: -0.5 },
    listContent: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },
    emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 80 },
    emptyIcon: { marginBottom: 16, opacity: 0.5 },
    emptyText: { fontSize: 18, color: theme.textoSecundario, fontWeight: "700" },
    bottomPanel: { backgroundColor: theme.fundoGeral, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: theme.borda },
    cupomSection: { marginBottom: 24 },
    cupomRow: { flexDirection: "row", gap: 12 },
    inputWrapper: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: theme.fundoProdutos, borderWidth: 1, borderColor: theme.borda, borderRadius: 12, paddingHorizontal: 16 },
    input: { flex: 1, height: 50, fontSize: 16, fontWeight: "700", color: theme.corTextoPrincipal, marginLeft: 10 },
    btnApply: { backgroundColor: theme.fundoProdutos, borderWidth: 1, borderColor: theme.borda, paddingHorizontal: 20, borderRadius: 12, justifyContent: "center" },
    btnApplyText: { color: theme.corTextoPrincipal, fontWeight: "900", textTransform: "uppercase", fontSize: 14 },
    discountMsg: { color: theme.corCategorias, fontWeight: "800", fontSize: 13, marginTop: 8 },
    errorMsg: { color: "#E53935", fontWeight: "800", fontSize: 13, marginTop: 8 },
    totalRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 },
    totalLabel: { fontSize: 16, color: theme.textoSecundario, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
    totalValue: { fontSize: 40, fontWeight: "900", color: theme.corBotoes, flexShrink: 1, paddingLeft: 16, letterSpacing: -1 },
    actionButtonsContainer: { flexDirection: "row", gap: 16 },
    btnSecondary: { flex: 1, height: 64, backgroundColor: theme.fundoProdutos, borderRadius: 32, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: theme.borda, paddingHorizontal: 16 },
    btnSecondaryText: { color: theme.corTextoPrincipal, fontSize: 16, fontWeight: "900" },
    btnPrimary: { flex: 1.5, flexDirection: "row", height: 64, backgroundColor: theme.corBotoes, borderRadius: 32, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
    btnPrimaryText: { color: theme.textoBotoes, fontSize: 18, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
    btnIcon: { marginLeft: 8 },
  });
