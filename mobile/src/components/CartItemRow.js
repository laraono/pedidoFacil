import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function CartItemRow({ item, onIncrease, onDecrease, onEdit }) {
  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.btnMinus} onPress={onDecrease}>
          <Feather name="minus" size={16} color={colors.textDark} />
        </TouchableOpacity>
        
        <Text style={styles.qty}>{item.quantity}</Text>
        
        <TouchableOpacity style={styles.btnPlus} onPress={onIncrease}>
          <Feather name="plus" size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Nome do Produto */}
      <Text style={styles.name} numberOfLines={2}>
        {item.name} {item.size?.name !== 'Padrão' ? `(${item.size?.name})` : ''}
      </Text>

      {/* Botão Editar */}
      <TouchableOpacity style={styles.btnEdit} onPress={onEdit}>
        <Text style={styles.btnEditText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    justifyContent: 'space-between',
  },
  btnMinus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.qtyBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qty: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textDark,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginHorizontal: 15,
  },
  btnEdit: {
    backgroundColor: colors.success,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  btnEditText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  }
});