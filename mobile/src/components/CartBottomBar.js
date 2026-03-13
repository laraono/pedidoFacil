import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';

export default function CartBottomBar({ barColor = '#4A4A4A' }) {
  const navigation = useNavigation();
  const { cartItems, cartTotal } = useCart();

  if (cartItems.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: barColor }]}>
      
      {/* CABEÇALHO DA LISTA (Figma) */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colLeft, styles.headerText]}>Pedido</Text>
        <Text style={[styles.colCenter, styles.headerText]}>Quantidade</Text>
        <Text style={[styles.colRight, styles.headerText]}>Preço</Text>
      </View>

      {/* ÁREA DE ROLAGEM DOS ITENS */}
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {cartItems.map((item, index) => (
          <View key={`${item.id}-${item.size.name}-${index}`} style={styles.itemRow}>
            
            {/* Nome e Info */}
            <View style={styles.colLeft}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemObs} numberOfLines={1}>
                {item.size.name !== 'Padrão' ? `Tam: ${item.size.name}` : 'Sem obs.'}
              </Text>
            </View>
            
            {/* Quantidade */}
            <Text style={[styles.colCenter, styles.itemQty]}>X{item.quantity}</Text>
            
            {/* Preço (Quantidade * Preço Unitário) */}
            <Text style={[styles.colRight, styles.itemPrice]}>
              R${(item.size.price * item.quantity).toFixed(2).replace('.', ',')}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* RODAPÉ DO CARRINHO */}
      <View style={styles.footer}>
        <View style={styles.totalWrapper}>
          <Text style={styles.totalLabel}>Total a pagar:</Text>
          <Text style={styles.totalValue}>R$ {cartTotal.toFixed(2).replace('.', ',')}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.finalizeButton}
          onPress={() => navigation.navigate('CartReview')}
        >
          <Text style={styles.finalizeButtonText}>Finalizar Pedido</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 25,
    paddingHorizontal: 20,
    maxHeight: 320,  
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 10,
    marginBottom: 5,
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  scrollArea: {
    maxHeight: 140, 
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  colLeft: { flex: 2, justifyContent: 'center', paddingRight: 5 },
  colCenter: { flex: 1, textAlign: 'center' },
  colRight: { flex: 1, textAlign: 'right' },
  itemName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemObs: {
    color: '#CCCCCC',
    fontSize: 11,
    marginTop: 2,
  },
  itemQty: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemPrice: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  totalWrapper: {
    flexDirection: 'column',
  },
  totalLabel: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  finalizeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  finalizeButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 15,
  }
});