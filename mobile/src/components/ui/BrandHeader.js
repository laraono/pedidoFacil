import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext";

export default function BrandHeader({ showBack = false }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const styles = useMemo(() => getStyles(theme, insets), [theme, insets]);

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Feather
              name="arrow-left"
              size={28}
              color={theme.corTextoPrincipal}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        {theme.logoUrl ? (
          <Image
            source={{ uri: theme.logoUrl }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {theme.nomeEstabelecimento || "PedidoFácil"}
          </Text>
        )}

        <View style={{ width: 40 }} />
      </View>
    </View>
  );
}

const getStyles = (theme, insets) =>
  StyleSheet.create({
    header: {
      backgroundColor: theme.headerGeral,
      paddingTop: insets.top,
      borderBottomWidth: 1,
      borderBottomColor: theme.bordaCard,
      zIndex: 10,
    },
    container: {
      height: 70,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    headerTitle: {
      color: theme.corTextoPrincipal,
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: -0.5,
      flex: 1,
      textAlign: "center",
    },
    logoImage: {
      flex: 1,
      height: 46,
    },
    backButton: {
      padding: 6,
      width: 40,
      alignItems: "center",
      justifyContent: "center",
    },
  });
