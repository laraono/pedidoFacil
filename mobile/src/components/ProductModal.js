import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

const { height } = Dimensions.get("window");

export default function ProductModal({
  visible,
  product,
  cartItem,
  onClose,
  onConfirm,
}) {
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [obs, setObs] = useState("");

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    if (visible) {
      setQuantity(cartItem ? cartItem.quantity : 1);
      setObs(cartItem?.observation || "");
    }
  }, [visible, cartItem]);

  if (!product) return null;

  const price = cartItem ? cartItem.size.price : product.sizes[0].price;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={28} color={theme.textoBotoes} />
          </TouchableOpacity>

          <View style={styles.content}>
            <Image
              source={product.image}
              style={styles.image}
              resizeMode="cover"
            />

            <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit>
              R$ {price.toFixed(2).replace(".", ",")}
            </Text>

            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
              {product.name}
            </Text>

            <Text style={styles.description} numberOfLines={2}>
              {product.description}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Alguma observação?"
              placeholderTextColor={theme.textoSecundario}
              value={obs}
              onChangeText={setObs}
              maxLength={100}
            />

            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Un:</Text>

              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={styles.btnQty}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  activeOpacity={0.6}
                >
                  <Text style={styles.btnQtyText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.btnQty}
                  onPress={() => setQuantity(quantity + 1)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.btnQtyText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => onConfirm(quantity, obs)}
            activeOpacity={0.9}
          >
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "85%",
      maxWidth: 400,
      alignItems: "center",
    },
    backButton: {
      alignSelf: "flex-start",
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.corBotoes,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      elevation: 5,
      shadowColor: theme.corBotoes,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    content: {
      width: "100%",
      backgroundColor: theme.fundoProdutos,
      borderRadius: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.borda,
      overflow: "hidden",
      paddingBottom: 24,
    },
    image: {
      width: "100%",
      height: 180,
      marginBottom: 20,
    },
    price: {
      fontSize: 32,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
      marginBottom: 4,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.textoSecundario,
      marginBottom: 12,
      paddingHorizontal: 16,
      textAlign: "center",
    },
    description: {
      fontSize: 14,
      color: theme.textoSecundario,
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    input: {
      width: "85%",
      backgroundColor: theme.fundoGeral,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 14,
      color: theme.corTextoPrincipal,
      borderWidth: 1,
      borderColor: theme.borda,
      marginBottom: 24,
    },
    qtyRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingHorizontal: 20,
      gap: 20,
    },
    qtyLabel: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.corTextoPrincipal,
    },
    qtyControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    btnQty: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: theme.fundoGeral,
      borderWidth: 1,
      borderColor: theme.borda,
      justifyContent: "center",
      alignItems: "center",
    },
    btnQtyText: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.textoSecundario,
      marginTop: -2,
    },
    qtyValue: {
      fontSize: 22,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
      minWidth: 30,
      textAlign: "center",
    },
    confirmButton: {
      backgroundColor: theme.corBotoes,
      paddingVertical: 16,
      paddingHorizontal: 40,
      borderRadius: 30,
      marginTop: 20,
      elevation: 6,
      shadowColor: theme.corBotoes,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    confirmButtonText: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.textoBotoes,
      letterSpacing: 0.5,
    },
  });