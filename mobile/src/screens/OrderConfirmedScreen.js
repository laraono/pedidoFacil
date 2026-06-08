import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import BrandHeader from "../components/ui/BrandHeader";

const COUNTDOWN = 15;

export default function OrderConfirmedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();

  const ticket = route.params?.ticket || "";
  const label = route.params?.label || (ticket ? `Totem #${ticket}` : "—");
  const customerName = route.params?.customerName || null;

  const isPaid = route.params?.isPaid || false;

  const [seconds, setSeconds] = useState(COUNTDOWN);

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    if (seconds <= 0) {
      navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather name="check" size={72} color={theme.textoBotoes} />
        </View>

        <Text style={styles.title}>Pedido realizado!</Text>

        <View style={styles.ticketBox}>
          <Text style={styles.ticketCaption}>{customerName ? "Olá," : "Seu número"}</Text>
          <Text style={styles.ticketNumber}>{customerName || label}</Text>
        </View>

        <View style={styles.instructionBox}>
          <Feather name="map-pin" size={22} color={theme.corCategorias} />
          <Text style={styles.instructionText}>
            {isPaid || customerName
              ? "Aguarde ser chamado\npelo seu nome"
              : "Dirija-se ao caixa para\nefetuar o pagamento"}
          </Text>
        </View>

        <Text style={styles.countdown}>Voltando ao início em {seconds}s</Text>

        <TouchableOpacity
          style={styles.btnNew}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "Welcome" }] })}
          activeOpacity={0.8}
        >
          <Text style={styles.btnNewText}>Novo Pedido</Text>
          <Feather name="arrow-right" size={20} color={theme.textoBotoes} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.fundoGeral },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      gap: 28,
    },
    iconCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: theme.corBotoes,
      alignItems: "center",
      justifyContent: "center",
      elevation: 12,
      shadowColor: theme.corBotoes,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    title: {
      fontSize: 38,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
      textAlign: "center",
      letterSpacing: -1,
    },
    ticketBox: {
      alignItems: "center",
      backgroundColor: theme.fundoProdutos,
      borderRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 40,
      borderWidth: 2,
      borderColor: theme.corBotoes,
      width: "100%",
      maxWidth: 340,
    },
    ticketCaption: {
      fontSize: 11,
      fontWeight: "900",
      color: theme.textoSecundario,
      textTransform: "uppercase",
      letterSpacing: 3,
      marginBottom: 6,
    },
    ticketNumber: {
      fontSize: 42,
      fontWeight: "900",
      color: theme.corBotoes,
      letterSpacing: -1,
    },
    instructionBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: theme.fundoProdutos,
      borderRadius: 16,
      padding: 20,
      width: "100%",
      maxWidth: 340,
      borderWidth: 1,
      borderColor: theme.borda,
    },
    instructionText: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700",
      color: theme.corTextoPrincipal,
      lineHeight: 26,
    },
    countdown: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.textoSecundario,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    btnNew: {
      flexDirection: "row",
      backgroundColor: theme.corBotoes,
      width: "100%",
      maxWidth: 340,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      elevation: 6,
      shadowColor: theme.corBotoes,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    btnNewText: {
      color: theme.textoBotoes,
      fontSize: 18,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
  });