import React, { useMemo } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

export default function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
  style,
}) {
  const { theme } = useTheme();

  const bgColor = useMemo(() => {
    if (variant === "success") return theme.categoriaAtiva;
    if (variant === "secondary") return theme.fundoProdutos;
    if (variant === "ghost") return "transparent";
    return theme.corBotoes;
  }, [variant, theme]);

  const textColor = useMemo(() => {
    if (variant === "secondary" || variant === "ghost")
      return theme.corTextoPrincipal;
    return theme.textoBotoes;
  }, [variant, theme]);

  const borderStyle =
    variant === "secondary" ? { borderWidth: 1, borderColor: theme.borda } : {};

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor },
        borderStyle,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && (
        <Feather name={icon} size={20} color={textColor} style={styles.icon} />
      )}
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  disabled: { opacity: 0.5 },
  text: {
    fontWeight: "900",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  icon: { marginRight: 10 },
});
