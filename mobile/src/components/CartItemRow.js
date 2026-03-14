import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext'; // <--- IMPORT DO TEMA

export default function CartItemRow({ item, onIncrease, onDecrease, onEdit }) {
  const { theme } = useTheme();

  // Mágica: Cria os estilos baseados no tema dinâmico
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        {/* Botão Menos: Discreto no Dark Mode */}
        <TouchableOpacity style={styles.btnMinus} onPress={onDecrease}>
          <Feather name="minus" size={16} color={theme.corTextoPrincipal} />
        </TouchableOpacity>
        
        {/* Quantidade */}
        <Text style={styles.qty}>{item.quantity}</Text>
        
        {/* Botão Mais: Destaque Neon */}
        <TouchableOpacity style={styles.btnPlus} onPress={onIncrease}>
          <Feather name="plus" size={16} color={theme.textoBotoes} />
        </TouchableOpacity>
      </View>

      {/* Nome do Produto */}
      <Text style={styles.name} numberOfLines={2}>
        {item.name} {item.size?.name !== 'Padrão' ? `(${item.size?.name})` : ''}
      </Text>

      {/* Botão Editar: Pílula escura moderna */}
      <TouchableOpacity style={styles.btnEdit} onPress={onEdit}>
        <Text style={styles.btnEditText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos Dinâmicos
const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.borda, // Linha separadora sutil
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
    backgroundColor: theme.borda, // Fundo cinza escuro para combinar com dark mode
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.corBotoes, // Verde Neon
    justifyContent: 'center',
    alignItems: 'center',
  },
  qty: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.corTextoPrincipal, // Texto branco
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.corTextoPrincipal, // Texto branco
    marginHorizontal: 15,
  },
  btnEdit: {
    backgroundColor: theme.fundoProdutos, // Fundo do card
    borderWidth: 1,
    borderColor: theme.borda, // Bordinha elegante
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  btnEditText: {
    color: theme.categoriaAtiva, // Texto Azul para mostrar que é uma ação secundária
    fontWeight: 'bold',
    fontSize: 14,
  }
});