import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "../../theme/colors";

export default function BrandHeader({
  showBack = false,
  title = "Restaurante Exemplo",
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather
              name="arrow-left-circle"
              size={28}
              color={colors.textLight}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}

        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 28 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#1e90ff", elevation: 4, zIndex: 10 },
  container: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "900" },
  backButton: { padding: 5 },
});
