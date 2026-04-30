import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

export default function ProductModal({ visible, product, onClose, onConfirm }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);

  const variations = product?.productVariations || product?.sizes || [];
  const isSingleSize = variations.length === 0;

  useEffect(() => {
    if (visible && product) {
      setQuantity(1);
      setObservation("");

      if (variations.length > 0) {
        setSelectedSize(null);
      } else {
        const price = Number(product.basePrice || product.price || 0);
        setSelectedSize({ name: "Único", price: price });
      }
    }
  }, [visible, product]);

  if (!product) return null;

  const currentTotal = selectedSize
    ? Number(selectedSize.price || selectedSize.Preco_Adicional || 0) * quantity
    : 0;

  const handleAdd = () => {
    if (!selectedSize) return;
    onConfirm(selectedSize, quantity, observation);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {product.name}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={theme.corTextoPrincipal} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {product.image && (
              <Image
                source={
                  typeof product.image === "string"
                    ? { uri: product.image }
                    : product.image
                }
                style={styles.productImage}
                resizeMode="cover"
              />
            )}

            {product.description ? (
              <Text style={styles.description}>{product.description}</Text>
            ) : null}

            {!isSingleSize && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Escolha o Tamanho</Text>
                {variations.map((size, index) => {
                  const isSelected = selectedSize?.name === size.name;
                  const priceValue = Number(
                    size.Preco_Adicional || size.addPrice || size.price || 0,
                  );

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.sizeOption,
                        isSelected && styles.sizeOptionSelected,
                      ]}
                      onPress={() =>
                        setSelectedSize({ ...size, price: priceValue })
                      }
                    >
                      <View style={styles.radioContainer}>
                        <View
                          style={[
                            styles.radioOuter,
                            isSelected && styles.radioOuterSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.sizeName}>{size.name}</Text>
                      </View>
                      <Text
                        style={[
                          styles.sizePrice,
                          isSelected && styles.sizePriceSelected,
                        ]}
                      >
                        R$ {priceValue.toFixed(2).replace(".", ",")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* 🔥 OBSERVAÇÃO CONDICIONAL */}
            {theme.permitirObservacoes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alguma observação?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Tirar cebola, sem gelo..."
                  placeholderTextColor="#999"
                  value={observation}
                  onChangeText={setObservation}
                  multiline
                />
              </View>
            )}

            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantidade</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  <Feather
                    name="minus"
                    size={20}
                    color={theme.corTextoPrincipal}
                  />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Feather
                    name="plus"
                    size={20}
                    color={theme.corTextoPrincipal}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.addBtn, !selectedSize && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={!selectedSize}
            >
              <Text style={styles.addBtnText}>
                {selectedSize ? "Adicionar" : "Selecione um tamanho"}
              </Text>
              {selectedSize && (
                <Text style={styles.addBtnPrice}>
                  R$ {currentTotal.toFixed(2).replace(".", ",")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    content: {
      backgroundColor: theme.fundoProdutos,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "90%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borda,
    },
    title: { fontSize: 22, fontWeight: "900", color: theme.corTextoPrincipal },
    closeBtn: { padding: 8 },
    scrollArea: { padding: 20 },
    productImage: {
      width: "100%",
      height: 200,
      borderRadius: 16,
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: theme.textoSecundario,
      marginBottom: 20,
    },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.textoSecundario,
      marginBottom: 12,
      textTransform: "uppercase",
    },
    sizeOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      borderWidth: 1,
      borderColor: theme.borda,
      borderRadius: 12,
      marginBottom: 8,
    },
    sizeOptionSelected: {
      borderColor: theme.corBotoes,
      backgroundColor: theme.corBotoes + "10",
    },
    radioContainer: { flexDirection: "row", alignItems: "center" },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.borda,
      marginRight: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    radioOuterSelected: { borderColor: theme.corBotoes },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.corBotoes,
    },
    sizeName: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.corTextoPrincipal,
    },
    sizePrice: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
    },
    sizePriceSelected: { color: theme.corBotoes },
    input: {
      backgroundColor: theme.fundoGeral,
      borderRadius: 12,
      padding: 15,
      color: theme.corTextoPrincipal,
      minHeight: 80,
      textAlignVertical: "top",
    },
    quantityContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },
    quantityLabel: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.corTextoPrincipal,
    },
    quantityControls: { flexDirection: "row", alignItems: "center" },
    qtyBtn: {
      width: 40,
      height: 40,
      backgroundColor: theme.fundoGeral,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    qtyValue: {
      width: 40,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "900",
    },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: theme.borda },
    addBtn: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: theme.corBotoes,
      padding: 20,
      borderRadius: 16,
    },
    addBtnDisabled: { backgroundColor: theme.borda },
    addBtnText: { color: theme.textoBotoes, fontSize: 18, fontWeight: "900" },
    addBtnPrice: { color: theme.textoBotoes, fontSize: 18, fontWeight: "900" },
  });
