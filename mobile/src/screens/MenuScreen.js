import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  useWindowDimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { useIdleTimer } from "../hooks/useIdleTimer";
import CartBottomBar from "../components/CartBottomBar";
import BrandHeader from "../components/ui/BrandHeader";
import ProductModal from "../components/ProductModal";

import { fetchFullMenu } from "../stores/menuStore";
import { connectMobileSocket } from "../services/socketService";

const API_BASE_URL = "http://192.168.1.39:3000";

const getFullImageUrl = (imagePath) => {
  
  if (!imagePath) return null; 
  if (typeof imagePath !== "string") return imagePath; 
  if (imagePath.startsWith("http") || imagePath.startsWith("data:")) {
    return { uri: imagePath }; 
  }
  return { uri: `${API_BASE_URL}/uploads/${imagePath}` };
};

export default function MenuScreen() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const { theme, loadTheme } = useTheme();
  const { width } = useWindowDimensions();
  const panHandlers = useIdleTimer(45);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const numColumns = width >= 600 ? 3 : 2;
  const availableWidth = width - 90 - 16;
  const cardWidth = availableWidth / numColumns - 12;

  const styles = useMemo(
    () => getStyles(theme, width, cardWidth),
    [theme, width, cardWidth],
  );

  const loadMenuData = async () => {
    try {
      const data = await fetchFullMenu();
      if (data) {
        setCategories(data.categories || []);
        setProducts(data.products || []);

        if (
          !selectedCategory &&
          data.categories &&
          data.categories.length > 0
        ) {
          setSelectedCategory(data.categories[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar cardápio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();

    const socket = connectMobileSocket();

    socket.on("menu_updated", () => {
      console.log("[Socket] Cardápio atualizado no servidor. Recarregando...");
      loadMenuData();
    });

    socket.on("theme_updated", () => {
      console.log("[Socket] Tema atualizado no servidor.");
      loadTheme();
    });

    return () => {
      socket.off("menu_updated");
      socket.off("theme_updated");
    };
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.categoryId === selectedCategory || p.category?.id === selectedCategory,
  );

  const handleConfirmAdd = (selectedSize, quantity, obs) => {
    addToCart(selectedProduct, selectedSize, quantity, obs);
    setModalVisible(false);
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.corBotoes} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} {...panHandlers}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.fundoGeral} />
      <BrandHeader title="PedidoFácil" />

      <View style={styles.mainContent}>
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Cardápio</Text>
          {categories.map((item) => {
            const isSelected = selectedCategory === item.id;
            
            const imageSource = getFullImageUrl(item.image);

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.sidebarItem,
                  isSelected && styles.sidebarItemSelected,
                ]}
                onPress={() => setSelectedCategory(item.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.imageWrapper,
                    isSelected && styles.imageWrapperSelected,
                  ]}
                >
                  <Image
                    source={imageSource}
                    style={styles.sidebarImage}
                    resizeMode="cover"
                  />
                  {isSelected && <View style={styles.activeIndicator} />}
                </View>
                <Text
                  style={[
                    styles.sidebarLabel,
                    isSelected && styles.sidebarLabelSelected,
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.contentArea}>
          <Text style={styles.categoryHeaderTitle}>
            {categories.find((c) => c.id === selectedCategory)?.name || ""}
          </Text>

          <View style={styles.gridContainer}>
            <FlatList
              data={filteredProducts}
              key={`grid-${numColumns}`}
              numColumns={numColumns}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                
                const imageSource = getFullImageUrl(item.image);

                return (
                  <TouchableOpacity
                    style={styles.productCard}
                    onPress={() => {
                      setSelectedProduct(item);
                      setModalVisible(true);
                    }}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={imageSource}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.productDescription} numberOfLines={2}>
                        {item.description}
                      </Text>

                      <View style={styles.productFooter}>
                        <View style={styles.priceBlock}>
                          {((item.productVariations &&
                            item.productVariations.length > 1) ||
                            (item.sizes && item.sizes.length > 1)) && (
                            <Text style={styles.startingFrom}>A partir de</Text>
                          )}
                          <Text
                            style={styles.productPrice}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            R${" "}
                            {item.productVariations &&
                            item.productVariations.length > 0 &&
                            item.productVariations[0].price !== undefined
                              ? Number(item.productVariations[0].price)
                                  .toFixed(2)
                                  .replace(".", ",")
                              : item.basePrice !== undefined &&
                                  item.basePrice !== null
                                ? Number(item.basePrice)
                                    .toFixed(2)
                                    .replace(".", ",")
                                : item.sizes && item.sizes.length > 0
                                  ? Number(item.sizes[0].price)
                                      .toFixed(2)
                                      .replace(".", ",")
                                  : "0,00"}
                          </Text>
                        </View>

                        <View style={styles.addBtnIcon}>
                          <Feather
                            name="plus"
                            size={20}
                            color={theme.textoBotoes}
                          />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
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

      <CartBottomBar />
    </SafeAreaView>
  );
}

const getStyles = (theme, width, cardWidth) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.fundoGeral,
    },
    mainContent: {
      flex: 1,
      flexDirection: "row",
    },
    sidebar: {
      backgroundColor: theme.fundoProdutos,
      borderRightWidth: 0,
      paddingTop: 24,
      alignItems: "center",
      width: 90,
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      zIndex: 10, 
    },
    sidebarTitle: {
      fontSize: 10,
      fontWeight: "900",
      color: theme.textoSecundario,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 20,
      textAlign: "center",
    },
    sidebarItem: {
      alignItems: "center",
      marginBottom: 24,
      width: "100%",
      paddingHorizontal: 4,
    },
    imageWrapper: {
      width: 60,
      height: 60,
      borderRadius: 30,
      padding: 3,
      borderWidth: 2,
      borderColor: "transparent",
      marginBottom: 10,
    },
    imageWrapperSelected: { borderColor: theme.corCategorias },
    sidebarImage: { width: "100%", height: "100%", borderRadius: 30 },
    activeIndicator: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.corCategorias,
      borderWidth: 2,
      borderColor: theme.fundoProdutos,
    },
    sidebarLabel: {
      textAlign: "center",
      fontWeight: "700",
      fontSize: 12,
      color: theme.textoSecundario,
      paddingHorizontal: 2,
    },
    sidebarLabelSelected: { color: theme.corTextoPrincipal, fontWeight: "900" },
    contentArea: { flex: 1, backgroundColor: theme.fundoGeral },
    categoryHeaderTitle: {
      fontSize: 28,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 8,
      letterSpacing: -0.5,
    },
    gridContainer: { flex: 1 },
    listContainer: { padding: 8, paddingBottom: 150 },
    productCard: {
      width: cardWidth,
      backgroundColor: theme.fundoProdutos,
      margin: 6,
      borderRadius: 16,
      overflow: "visible", 
      borderWidth: 0,

      elevation: 6, 
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    productImage: {
      width: "100%",
      height: 120,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    productInfo: {
      padding: 12,
      flex: 1,
      justifyContent: "space-between",
    },
    productTitle: {
      fontWeight: "900",
      fontSize: 16,
      color: theme.corTextoPrincipal,
      marginBottom: 4,
    },
    productDescription: {
      fontSize: 12,
      color: theme.textoSecundario,
      marginBottom: 8,
      lineHeight: 16,
    },
    productFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
    },
    priceBlock: {
      flex: 1,
      paddingRight: 8,
    },
    startingFrom: {
      fontSize: 9,
      fontWeight: "900",
      textTransform: "uppercase",
      color: theme.textoSecundario,
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    productPrice: {
      fontWeight: "900",
      color: theme.corBotoes,
      fontSize: 18,
      letterSpacing: -0.5,
    },
    addBtnIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.corBotoes,
      justifyContent: "center",
      alignItems: "center",
    },
  });
