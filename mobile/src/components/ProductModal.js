import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import Button from "./ui/Button";
import colors from "../theme/colors";

export default function ProductModal({
  visible,
  product,
  cartItem,
  onClose,
  onConfirm,
}) {
  const [quantity, setQuantity] = useState(1);
  const [obs, setObs] = useState("");

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
        <View style={styles.content}>
          {/* Imagem agora ocupa 100% da largura do topo */}
          <Image
            source={product.image}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Bloco de detalhes com bastante espaçamento interno */}
          <View style={styles.detailsContainer}>
            <Text style={styles.price}>
              R$ {price.toFixed(2).replace(".", ",")}
            </Text>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.description}>{product.description}</Text>

            <TextInput
              style={styles.input}
              placeholder="Alguma observação? (Ex: Sem cebola)"
              placeholderTextColor="#999"
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
                >
                  <Text style={styles.btnQtyText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.btnQty}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.btnQtyText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                style={styles.footerBtn}
              />
              <View style={{ width: 16 }} />{" "}
              {/* Aumentei o espaço entre os botões */}
              <Button
                title="Confirmar"
                onPress={() => onConfirm(quantity, obs)}
                style={styles.footerBtn}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "white",
    width: 400, 
    maxWidth: "100%",
    borderRadius: 24,
    alignItems: "center",
    elevation: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 220, 
  },
  detailsContainer: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  price: {
    fontSize: 34,
    fontWeight: "900",
    color: "#000",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,  
  },
  input: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#333",
    marginBottom: 30,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 30,
  },
  qtyLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginRight: 20, 
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnQty: {
    width: 44,
    height: 44, 
    backgroundColor: "#EEEEEE",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  btnQtyText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginTop: -3,
  },
  qtyValue: {
    fontSize: 24,
    fontWeight: "900",
    width: 50,
    textAlign: "center",
    color: "#000",
  },
  footer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 16,
  },
});
