import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function CartItemRow({ item, onIncrease, onDecrease, onEdit }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        {/* Botão Menos: Cinza suave no modo Clean */}
        <TouchableOpacity style={styles.btnMinus} onPress={onDecrease} activeOpacity={0.7}>
          <Feather name="minus" size={16} color={theme.corTextoPrincipal} />
        </TouchableOpacity>
        
        {/* Quantidade */}
        <Text style={styles.qty}>{item.quantity}</Text>
        
        {/* Botão Mais: Azul de ação */}
        <TouchableOpacity style={styles.btnPlus} onPress={onIncrease} activeOpacity={0.7}>
          <Feather name="plus" size={16} color={theme.textoBotoes} />
        </TouchableOpacity>
      </View>

      {/* Info do Produto e Observação */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name} {item.size?.name !== 'Padrão' ? `(${item.size?.name})` : ''}
        </Text>
        {item.observation ? (
          <Text style={styles.obsText} numberOfLines={2}>
            Obs: {item.observation}
          </Text>
        ) : null}
        <Text style={styles.priceText}>
          R$ {(item.size.price * item.quantity).toFixed(2).replace('.', ',')}
        </Text>
      </View>

      {/* Botão Editar: Sem bordas pesadas, estilo ghost button */}
      <TouchableOpacity style={styles.btnEdit} onPress={onEdit} activeOpacity={0.7}>
        <Feather name="edit-2" size={18} color={theme.corBotoes} />
        <Text style={styles.btnEditText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.borda,
    backgroundColor: theme.fundoProdutos,
    borderRadius: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.borda,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
    justifyContent: 'space-between',
    backgroundColor: theme.fundoGeral,
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.borda,
  },
  btnMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.fundoProdutos,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  btnPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.corBotoes,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qty: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.corTextoPrincipal,
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.corTextoPrincipal,
    marginBottom: 4,
  },
  obsText: {
    fontSize: 12,
    color: theme.textoSecundario,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.corBotoes,
  },
  btnEdit: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  btnEditText: {
    color: theme.corBotoes,
    fontWeight: '800',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
  }
});