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

  useEffect(() => {
    if (visible && product) {
      setQuantity(1);
      setObservation("");
      setSelectedSize(product.sizes?.length > 0 ? product.sizes[0] : null);
    }
  }, [visible, product]);

  if (!product) return null;

  const currentTotal = selectedSize ? selectedSize.price * quantity : 0;

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
                source={product.image}
                style={styles.productImage}
                resizeMode="cover"
              />
            )}

            <Text style={styles.description}>{product.description}</Text>

            {product.sizes && product.sizes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Escolha o Tamanho</Text>
                {product.sizes.map((size, index) => {
                  const isSelected = selectedSize?.name === size.name;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.sizeOption,
                        isSelected && styles.sizeOptionSelected,
                      ]}
                      onPress={() => setSelectedSize(size)}
                      activeOpacity={0.7}
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
                        R$ {size.price.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alguma observação?</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Tirar cebola, sem gelo..."
                placeholderTextColor={theme.textoSecundario}
                value={observation}
                onChangeText={setObservation}
                multiline
                maxLength={100}
              />
            </View>

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
              <Text style={styles.addBtnPrice}>
                R$ {currentTotal.toFixed(2)}
              </Text>
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
      alignItems: "center",
    },
    content: {
      backgroundColor: theme.fundoProdutos,
      width: "100%",
      maxWidth: 600,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "90%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borda,
    },
    title: {
      fontSize: 24,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
      flex: 1,
    },
    closeBtn: {
      padding: 8,
      backgroundColor: theme.fundoGeral,
      borderRadius: 8,
    },
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
      lineHeight: 24,
      marginBottom: 24,
    },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "900",
      textTransform: "uppercase",
      color: theme.textoSecundario,
      letterSpacing: 1,
      marginBottom: 12,
    },
    sizeOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderWidth: 1,
      borderColor: theme.borda,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: theme.fundoGeral,
    },
    sizeOptionSelected: {
      borderColor: theme.corBotoes,
      backgroundColor: `${theme.corBotoes}15`,
    },
    radioContainer: { flexDirection: "row", alignItems: "center" },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.textoSecundario,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
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
      borderWidth: 1,
      borderColor: theme.borda,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.corTextoPrincipal,
      minHeight: 80,
      textAlignVertical: "top",
    },
    quantityContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: theme.fundoGeral,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borda,
      marginBottom: 40,
    },
    quantityLabel: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.corTextoPrincipal,
    },
    quantityControls: { flexDirection: "row", alignItems: "center" },
    qtyBtn: {
      width: 44,
      height: 44,
      backgroundColor: theme.fundoProdutos,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    qtyValue: {
      width: 40,
      textAlign: "center",
      fontSize: 24,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.borda,
      backgroundColor: theme.fundoProdutos,
    },
    addBtn: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.corBotoes,
      padding: 20,
      borderRadius: 16,
    },
    addBtnDisabled: { backgroundColor: theme.borda },
    addBtnText: {
      color: theme.textoBotoes,
      fontSize: 18,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    addBtnPrice: { color: theme.textoBotoes, fontSize: 20, fontWeight: "900" },
  });
