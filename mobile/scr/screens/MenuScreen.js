import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import icon from '../../assets/food.jpg';
import food from '../../assets/hamburguer.png'

const categories = [
  {
    id: 1,
    name: 'Lanches',
    image: icon
  },
  {
    id: 2,
    name: 'Bebidas',
    image: icon
  },
  {
    id: 3,
    name: 'Sobremesas',
    image: icon
  }
];

const products = [
  {
    id: 1,
    name: 'X-Bacon',
    description: 'Hambúrguer com muito bacon crocante.',
    image: food,
    categoryId: 1,
    sizes: [
      { name: 'Padrão', price: 25.0 },
      { name: 'Grande', price: 30.0 }
    ]
  },
  {
    id: 2,
    name: 'X-Salada',
    description: 'Hambúrguer com muita salada crocante.',
    image: food,
    categoryId: 1,
    sizes: [
      { name: 'Padrão', price: 25.0 },
      { name: 'Grande', price: 30.0 }
    ]
  },
  {
    id: 3,
    name: 'X-Salada',
    description: 'Hambúrguer com muita salada crocante.',
    image: food,
    categoryId: 2,
    sizes: [
      { name: 'Padrão', price: 25.0 },
      { name: 'Grande', price: 30.0 }
    ]
  },
];

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantities, setQuantities] = useState({});

  const changeQuantity = (sizeName, change) => {
  setQuantities(prev => {
    const current = prev[sizeName] || 0;
    const updated = current + change;

    return {
      ...prev,
      [sizeName]: updated < 0 ? 0 : updated
    };
  });
};

  const filteredProducts = products.filter(
    p => p.categoryId === selectedCategory
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurante Exemplo</Text>
      </View>

      <View style={styles.mainContent}>

        <View style={styles.sidebar}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.sidebarItem,
                selectedCategory === item.id
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Image
                source={item.image}
                style={styles.sidebarImage}
                resizeMode="contain"
              />

              <Text style={styles.sidebarLabel}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentArea}>

          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            contentContainerStyle={{ padding: 10 }}
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

                <Text style={styles.productTitle}>
                  {item.name}
                </Text>

                <Text style={styles.productDescription}>
                  {item.description}
                </Text>

                <Text style={styles.productPrice}>
                  R$ {item.sizes[0].price.toFixed(2)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedProduct.name}
                </Text>

                {selectedProduct.sizes.map((size, index) => (
                  <View key={index} style={styles.sizeRow}>
                    <View>
                      <Text style={styles.modalSizeName}>
                        {size.name}
                      </Text>
                      <Text style={styles.modalSizePrice}>
                        R$ {size.price.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => changeQuantity(size.name, -1)}
                      >
                        <Text style={styles.qtyText}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.qtyNumber}>
                        {quantities[size.name] || 0}
                      </Text>

                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => changeQuantity(size.name, 1)}
                      >
                        <Text style={styles.qtyText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setModalVisible(false);
                      setQuantities({});
                    }}
                  >
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      console.log('Itens adicionados:', quantities);
                      setModalVisible(false);
                      setQuantities({});
                    }}
                  >
                    <Text style={styles.addText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ddd'
  },

  header: {
    height: 80,
    backgroundColor: '#1e90ff',
    justifyContent: 'center',
    alignItems: 'center'
  },

  headerTitle: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold'
  },

  mainContent: {
    flex: 1,
    flexDirection: 'row'
  },

  sidebar: {
    width: 140,
    backgroundColor: '#4DB8FF',
    paddingTop: 20,
    alignItems: 'center'
  },

  sidebarItem: {
    alignItems: 'center',
    marginBottom: 22,
    paddingVertical: 12,
    width: '80%',
    borderRadius: 14
  },

  sidebarImage: {
    width: 80,
    height: 80,
    marginBottom: 6
  },

  sidebarLabel: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600'
  },

  /* CONTEÚDO */
  contentArea: {
    flex: 1,
    backgroundColor: '#0d5c9f'
  },

  /* PRODUTOS */
  productCard: {
    flex: 0.50,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 15,
    padding: 10
  },

  imagePlaceholder: {
    height: 90,
    backgroundColor: '#222',
    borderRadius: 10,
    marginBottom: 8
  },

  productTitle: {
    fontWeight: 'bold',
    fontSize: 13
  },

  productDescription: {
    fontSize: 11,
    color: '#666'
  },

  productPrice: {
    marginTop: 5,
    fontWeight: 'bold',
    color: '#1e90ff'
  },

  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 8
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  modalContent: {
    width: '30%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },

  modalSize: {
    fontSize: 14,
    marginBottom: 5
  },

  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },

  modalSizeName: {
    fontSize: 14,
    fontWeight: '600'
  },

  modalSizePrice: {
    fontSize: 12,
    color: '#666'
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },

  qtyText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16
  },

  qtyNumber: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },

  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ccc',
    alignItems: 'center'
  },

  cancelText: {
    fontWeight: 'bold',
    color: '#333'
  },

  addButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#1e90ff',
    alignItems: 'center'
  },

  addText: {
    color: 'white',
    fontWeight: 'bold'
  },
});