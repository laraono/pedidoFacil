import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { appConfig, saveAppConfig } from "../services/apiConfig";
import { useTheme } from "../contexts/ThemeContext";

interface ConfigScreenProps {
  onFinishConfig: () => void
}

export default function ConfigScreen({ onFinishConfig }: ConfigScreenProps) {
  const { loadTheme } = useTheme();
  const [selfServiceCode, setSelfServiceCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    setErrorMsg("");

    if (!selfServiceCode) {
      setErrorMsg("Preencha o código de autoatendimento.");
      return;
    }

    if (!appConfig.API_URL) {
      setErrorMsg("URL do servidor não configurada. Verifique a instalação do app.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${appConfig.API_URL}/estabelecimento/code/${selfServiceCode}`);

      if (!response.ok) {
        let msg = "Código do estabelecimento inválido ou não encontrado.";
        try {
          const errData = await response.json();
          msg = errData.error || errData.message || msg;
        } catch {}
        setErrorMsg(msg);
        return;
      }

      const data = await response.json();
      const fetchedEstablishmentId = data.id;

      if (!fetchedEstablishmentId) {
        setErrorMsg("O servidor não retornou um ID válido.");
        return;
      }

      await saveAppConfig(fetchedEstablishmentId, selfServiceCode);
      await loadTheme();
      onFinishConfig();
    } catch (error: any) {
      const msg = error?.message || "";
      if (msg.includes("Network request failed") || msg.includes("Failed to fetch")) {
        setErrorMsg("Não foi possível conectar ao servidor. Verifique o IP e a porta.");
      } else {
        setErrorMsg(msg || "Erro ao conectar ao servidor.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.card}>
        <Text style={styles.title}>PedidoFácil</Text>
        <Text style={styles.subtitle}>Configuração do Totem</Text>

        <Text style={styles.label}>Código do Autoatendimento</Text>
        <TextInput
          style={[styles.input, !!errorMsg && styles.inputError]}
          value={selfServiceCode}
          onChangeText={(t) => { setSelfServiceCode(t); setErrorMsg(""); }}
          placeholder="ex: TOTEM-01"
          autoCapitalize="characters"
        />

        {!!errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

        <TouchableOpacity style={[styles.button, isSaving && styles.buttonDisabled]} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.buttonText}>{isSaving ? "Buscando Estabelecimento..." : "Conectar e Iniciar"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#ffffff", padding: 24, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1f2937", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#6b7280", textAlign: "center", marginBottom: 32 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8, color: "#111827" },
  inputError: { borderColor: "#ef4444" },
  error: { color: "#ef4444", fontSize: 13, fontWeight: "600", marginBottom: 16 },
  button: { backgroundColor: "#3b82f6", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonDisabled: { backgroundColor: "#93c5fd" },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
