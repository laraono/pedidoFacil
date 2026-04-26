import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Colors from "../constants/Colors";

const C = Colors.dark;

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const handleStart = () => {
    navigation.navigate("Menu");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.background} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoBox}>
            <Feather name="coffee" size={52} color={C.tint} />
          </View>
        </View>

        {/* Texto */}
        <Text style={styles.title}>Restaurante Exemplo</Text>
        <Text style={styles.subtitle}>Bem-vindo! Faça seu pedido{'\n'}diretamente por aqui.</Text>

        {/* CTA */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>Toque para começar</Text>
          <Feather name="arrow-right" size={22} color="#FFFFFF" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Autoatendimento</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoWrapper: { marginBottom: 32 },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: C.tint,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: C.text,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 52,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.tint,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    elevation: 8,
    shadowColor: C.tint,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  footer: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    paddingBottom: 24,
  },
});
