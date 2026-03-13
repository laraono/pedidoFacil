import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../theme/colors';

export default function Button({ title, onPress, variant = 'primary', icon, disabled, style }) {
  const bgColor = variant === 'success' ? colors.success : (variant === 'secondary' ? '#EEEEEE' : colors.primary);
  const textColor = variant === 'secondary' ? '#555555' : colors.textLight;

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: bgColor }, disabled && styles.disabled, style]} 
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <Feather name={icon} size={18} color={textColor} style={styles.icon} />}
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 25, alignItems: 'center', justifyContent: 'center', minWidth: 120 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '900', fontSize: 16 },
  icon: { marginRight: 8 }
});