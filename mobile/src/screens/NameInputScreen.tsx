import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useIdleTimer } from "../hooks/useIdleTimer";
import BrandHeader from "../components/ui/BrandHeader";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export default function NameInputScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { theme } = useTheme();
  const panHandlers = useIdleTimer(90);

  const params = route.params as { appliedDiscount?: number } | undefined;
  const appliedDiscount = params?.appliedDiscount || 0;

  const [name, setName] = useState("");

  const { width } = Dimensions.get("window");
  const styles = useMemo(() => getStyles(theme, width), [theme, width]);

  const MAX_NAME_LENGTH = 30;
  const pressKey = (key: string) => setName((prev) => prev.length < MAX_NAME_LENGTH ? prev + key : prev);
  const pressSpace = () => setName((prev) => prev.length < MAX_NAME_LENGTH ? prev + " " : prev);
  const pressBackspace = () => setName((prev) => prev.slice(0, -1));

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    navigation.navigate("Payment", { appliedDiscount, description: trimmed });
  };

  return (
    <SafeAreaView style={styles.safeArea} {...panHandlers}>
      <BrandHeader showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
        <View style={styles.centerWrapper}>
          <Text style={styles.stepLabel}>IDENTIFICAÇÃO</Text>
          <Text style={styles.title}>Como você se chama?</Text>
          <Text style={styles.subtitle}>Seu nome aparecerá no pedido para facilitar a retirada.</Text>

          <View style={styles.displayBox}>
            <Text style={[styles.displayText, !name && styles.displayPlaceholder]} numberOfLines={1} adjustsFontSizeToFit>
              {name || "Seu nome aqui..."}
            </Text>
          </View>

          <View style={styles.keyboardWrapper}>
            {ROWS.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.row}>
                {row.map((key) => (
                  <TouchableOpacity key={key} style={styles.key} onPress={() => pressKey(key)} activeOpacity={0.7}>
                    <Text style={styles.keyText}>{key}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <View style={styles.row}>
              <TouchableOpacity style={styles.keySpace} onPress={pressSpace} activeOpacity={0.7}>
                <Text style={styles.keyText}>ESPAÇO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keyBackspace} onPress={pressBackspace} activeOpacity={0.7}>
                <Feather name="delete" size={22} color={theme.corTextoPrincipal} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnConfirm, !name.trim() && styles.btnDisabled]}
            onPress={handleConfirm}
            disabled={!name.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.btnConfirmText}>Confirmar</Text>
            <Feather name="arrow-right" size={22} color={theme.textoBotoes} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any, width: number) => {
  const KEY_GAP = 6;
  const H_PADDING = 20;
  const ROW_MAX = 10;
  const availW = Math.min(width, 740) - H_PADDING * 2;
  const keySize = Math.min(56, Math.max(32, Math.floor((availW - KEY_GAP * (ROW_MAX - 1)) / ROW_MAX)));
  const keyHeight = Math.max(keySize, 44);
  const keyFontSize = Math.max(13, Math.min(Math.floor(keySize * 0.6), 20));
  const keyRadius = Math.min(10, Math.floor(keySize * 0.28));
  const keyShadow = { elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 };

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.fundoGeral },
    scrollContent: { flexGrow: 1, paddingBottom: 32 },
    centerWrapper: { alignSelf: "center", width: "100%", maxWidth: 740, paddingHorizontal: H_PADDING, paddingTop: 28, alignItems: "center" },
    stepLabel: { fontSize: 10, fontWeight: "900", color: theme.corBotoes, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 },
    title: { fontSize: 30, fontWeight: "900", color: theme.corTextoPrincipal, textAlign: "center", letterSpacing: -0.5, marginBottom: 8 },
    subtitle: { fontSize: 14, color: theme.textoSecundario, textAlign: "center", fontWeight: "600", marginBottom: 28, lineHeight: 20 },
    displayBox: { width: "100%", backgroundColor: theme.fundoProdutos, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 18, borderWidth: 2, borderColor: theme.corBotoes, marginBottom: 28, minHeight: 66, justifyContent: "center" },
    displayText: { fontSize: 32, fontWeight: "900", color: theme.corTextoPrincipal, textAlign: "center", letterSpacing: 1 },
    displayPlaceholder: { color: theme.textoSecundario, fontWeight: "500", fontSize: 18 },
    keyboardWrapper: { width: "100%", gap: 8, marginBottom: 28 },
    row: { flexDirection: "row", justifyContent: "center", gap: KEY_GAP },
    key: { backgroundColor: theme.fundoProdutos, borderRadius: keyRadius, width: keySize, height: keyHeight, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: theme.borda, ...keyShadow },
    keyText: { fontSize: keyFontSize, fontWeight: "900", color: theme.corTextoPrincipal },
    keySpace: { flex: 1, maxWidth: 260, backgroundColor: theme.fundoProdutos, borderRadius: keyRadius, height: keyHeight, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: theme.borda, ...keyShadow },
    keyBackspace: { backgroundColor: theme.fundoProdutos, borderRadius: keyRadius, width: keySize * 2 + KEY_GAP, height: keyHeight, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: theme.borda, ...keyShadow },
    btnConfirm: { flexDirection: "row", backgroundColor: theme.corBotoes, width: "100%", height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center", gap: 12, elevation: 6, shadowColor: theme.corBotoes, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    btnDisabled: { opacity: 0.35 },
    btnConfirmText: { color: theme.textoBotoes, fontSize: 20, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  });
};
