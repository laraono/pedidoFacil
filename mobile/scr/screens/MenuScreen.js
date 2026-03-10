import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet
} from 'react-native';

import { categories, products } from '../stores/menuStore';

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredProducts = products.filter(
    p => p.categoryId === selectedCategory
  );

  return (
    <View style={styles.container}>

      {/* CATEGORIAS */}
      <View style={styles.categories}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={styles.categoryButton}
          >
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PRODUTOS */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => {
              setSelectedProduct(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.productTitle}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>R$ {item.sizes[0].price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          {selectedProduct && (
            <>
              <Text style={styles.productTitle}>
                {selectedProduct.name}
              </Text>

              {selectedProduct.sizes.map((size, index) => (
                <Text key={index}>
                  {size.name} - R$ {size.price.toFixed(2)}
                </Text>
              ))}

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text>Fechar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  categoryButton: {
    padding: 10,
    backgroundColor: '#009DFF',
    borderRadius: 8
  },
  categoryText: {
    color: 'white',
    fontWeight: 'bold'
  },
  productCard: {
    backgroundColor: '#eee',
    padding: 15,
    margin: 10,
    borderRadius: 10
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 8
  }
});