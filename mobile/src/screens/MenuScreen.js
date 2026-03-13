import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  useWindowDimensions,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../contexts/CartContext";

import CartBottomBar from "../components/CartBottomBar";
import BrandHeader from "../components/ui/BrandHeader";
import ProductModal from "../components/ProductModal";

import icon from "../../assets/food.jpg";
import food from "../../assets/hamburguer.png";

const categories = [
  { id: 1, name: "Lanches", image: icon },
  { id: 2, name: "Bebidas", image: icon },
  { id: 3, name: "Sobremesas", image: icon },
];

const products = [
  {
    id: 1,
    name: "X-Bacon",
    description: "Hambúrguer com muito bacon crocante.",
    image: food,
    categoryId: 1,
    sizes: [{ name: "Padrão", price: 25.0 }],
  },
  {
    id: 2,
    name: "X-Salada",
    description: "Hambúrguer com muita salada crocante.",
    image: food,
    categoryId: 1,
    sizes: [{ name: "Padrão", price: 25.0 }],
  },
  {
    id: 3,
    name: "Refrigerante Cola",
    description: "Lata 350ml bem gelada.",
    image: food,
    categoryId: 2,
    sizes: [{ name: "Padrão", price: 5.0 }],
  },
];

export default function MenuScreen() {
  const { addToCart } = useCart();
  const { width } = useWindowDimensions();

  const [selectedCategory, setSelectedCategory] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getNumColumns = (screenWidth) => {
    if (screenWidth >= 1200) return 4;
    if (screenWidth >= 900) return 3;
    return 2;
  };

  const numColumns = getNumColumns(width);
  const isTabletOrWeb = width >= 600;

  const filteredProducts = products.filter(
    (p) => p.categoryId === selectedCategory,
  );

  const handleConfirmAdd = (quantity, obs) => {
    addToCart(selectedProduct, selectedProduct.sizes[0], quantity, obs);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e90ff" />

      <BrandHeader title="Restaurante Exemplo" />

      <View style={styles.mainContent}>
        <View style={[styles.sidebar, { width: isTabletOrWeb ? 120 : 85 }]}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.sidebarItem,
                selectedCategory === item.id && styles.sidebarItemSelected,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Image
                source={item.image}
                style={[
                  styles.sidebarImage,
                  {
                    width: isTabletOrWeb ? 60 : 50,
                    height: isTabletOrWeb ? 60 : 50,
                  },
                ]}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.sidebarLabel,
                  {
                    fontSize: isTabletOrWeb ? 14 : 11,
                    color: selectedCategory === item.id ? "#1e90ff" : "white",
                  },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentArea}>
          {/* Removido o alignItems: 'center' para alinhar os itens à esquerda no PC */}
          <View style={styles.gridContainer}>
            <FlatList
              data={filteredProducts}
              key={`grid-${numColumns}`}
              numColumns={numColumns}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productCard}
                  onPress={() => {
                    setSelectedProduct(item);
                    setModalVisible(true);
                  }}
                >
                  <Image
                    source={item.image}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle}>{item.name}</Text>
                    <Text style={styles.productDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <Text style={styles.productPrice}>
                      R$ {item.sizes[0].price.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </View>

      <ProductModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmAdd}
      />

      <CartBottomBar barColor="#4A4A4A" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  mainContent: { flex: 1, flexDirection: "row" },
  sidebar: {
    backgroundColor: "#4DB8FF",
    paddingTop: 15,
    alignItems: "center",
    elevation: 5,
  },
  sidebarItem: {
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 10,
    width: "85%",
    borderRadius: 12,
  },
  sidebarItemSelected: { backgroundColor: "white" },
  sidebarImage: { marginBottom: 6, borderRadius: 10 },
  sidebarLabel: { textAlign: "center", fontWeight: "bold" },
  contentArea: { flex: 1, backgroundColor: "#E8F4FA" },
  gridContainer: { flex: 1 }, 
  listContainer: { padding: 12, paddingBottom: 150 }, 
  productCard: {
    flex: 1,
    backgroundColor: "white",
    margin: 6,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: 300, 
  },
  productImage: { width: "100%", height: 120 }, 
  productInfo: { padding: 12 },
  productTitle: {
    fontWeight: "900",
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  productDescription: { fontSize: 11, color: "#777", marginBottom: 8 },
  productPrice: { fontWeight: "900", color: "#1e90ff", fontSize: 15 },
});
