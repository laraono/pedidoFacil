import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { appConfig } from "../services/apiConfig";

const MP_PUBLIC_KEY = "APP_USR-ba3efb9f-43f7-41b0-8c60-44b4bd0969ee";

function buildBrickHtml(amount, method) {
  const isPix = method === "PIX";
  const paymentMethodsConfig = isPix
    ? `creditCard: "none", debitCard: "none", ticket: "none", bankTransfer: ["pix"], atm: "none", onboarding_credits: "none", wallet_purchase: "none"`
    : `creditCard: "all", debitCard: "all", ticket: "none", bankTransfer: "none", atm: "none", onboarding_credits: "none", wallet_purchase: "none"`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <script src="https://sdk.mercadopago.com/js/v2"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #1a1a2e; padding: 16px; font-family: sans-serif; }
    #paymentBrick_container { margin-top: 8px; }
    .loading { color: #fff; text-align: center; padding: 40px; font-size: 16px; }
  </style>
</head>
<body>
  <div id="paymentBrick_container"></div>
  <script>
    const mp = new MercadoPago("${MP_PUBLIC_KEY}", { locale: "pt-BR" });
    const bricksBuilder = mp.bricks();

    const settings = {
      initialization: {
        amount: ${amount},
        payer: { email: "comprador@teste.com" }
      },
      customization: {
        paymentMethods: { ${paymentMethodsConfig} },
        visual: { style: { theme: "dark" } }
      },
      callbacks: {
        onReady: () => {},
        onSubmit: ({ selectedPaymentMethod, formData }) => {
          return new Promise((resolve, reject) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "SUBMIT",
              selectedPaymentMethod,
              formData
            }));
            resolve();
          });
        },
        onError: (error) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "ERROR",
            error: error.message || "Erro no formulário"
          }));
        }
      }
    };

    bricksBuilder.create("payment", "paymentBrick_container", settings)
      .catch((err) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "ERROR",
          error: "Erro ao carregar formulário de pagamento"
        }));
      });
  </script>
</body>
</html>`;
}

export default function MPBricksScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { clearCart } = useCart();

  const { amount, method, orderId } = route.params;

  const [status, setStatus] = useState("brick"); // brick | processing | pix_qr | approved | rejected
  const [pixQrBase64, setPixQrBase64] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const webViewRef = useRef(null);

  const html = buildBrickHtml(amount, method);

  async function handleWebViewMessage(event) {
    let msg;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (msg.type === "ERROR") {
      setErrorMsg(msg.error);
      setStatus("rejected");
      return;
    }

    if (msg.type === "SUBMIT") {
      setStatus("processing");
      try {
        const response = await fetch(`${appConfig.API_URL}/totem/payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-totem-code": appConfig.selfServiceCode,
          },
          body: JSON.stringify({
            formData: msg.formData,
            amount,
            description: `Pedido totem #${orderId}`,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.error || "Erro ao processar pagamento");
          setStatus("rejected");
          return;
        }

        if (data.pixQrCodeBase64) {
          setPixQrBase64(data.pixQrCodeBase64);
          setStatus("pix_qr");
          return;
        }

        if (data.status === "approved") {
          setStatus("approved");
          setTimeout(() => {
            clearCart();
            navigation.navigate("Welcome");
          }, 3500);
        } else {
          setErrorMsg("Pagamento não aprovado. Tente novamente.");
          setStatus("rejected");
        }
      } catch {
        setErrorMsg("Erro de conexão. Tente novamente.");
        setStatus("rejected");
      }
    }
  }

  function handleRetry() {
    setStatus("brick");
    setErrorMsg("");
    setPixQrBase64(null);
  }

  function handleCancel() {
    clearCart();
    navigation.navigate("Welcome");
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.fundoGeral }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backBtn}>
          <Feather name="x" size={22} color={theme.corTextoPrincipal} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.corTextoPrincipal }]}>
          {method === "PIX" ? "Pagar com PIX" : "Pagar com Cartão"}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {status === "brick" && (
        <WebView
          ref={webViewRef}
          source={{ html }}
          onMessage={handleWebViewMessage}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={theme.corBotoes} />
            </View>
          )}
          javaScriptEnabled
          domStorageEnabled
        />
      )}

      {status === "processing" && (
        <View style={styles.center}>
          <ActivityIndicator size={64} color={theme.corBotoes} />
          <Text style={[styles.statusText, { color: theme.corTextoPrincipal }]}>
            Processando pagamento...
          </Text>
        </View>
      )}

      {status === "pix_qr" && (
        <View style={styles.center}>
          <Text style={[styles.statusText, { color: theme.corTextoPrincipal, marginBottom: 24 }]}>
            Escaneie o QR Code com o app do banco
          </Text>
          {pixQrBase64 && (
            <Image
              source={{ uri: `data:image/png;base64,${pixQrBase64}` }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          )}
          <Text style={[styles.hint, { color: theme.textoSecundario }]}>
            Após o pagamento, sua confirmação aparecerá automaticamente.
          </Text>
        </View>
      )}

      {status === "approved" && (
        <View style={styles.center}>
          <Feather name="check-circle" size={80} color="#4CAF50" style={{ marginBottom: 24 }} />
          <Text style={[styles.statusText, { color: theme.corTextoPrincipal }]}>
            Pagamento aprovado!
          </Text>
        </View>
      )}

      {status === "rejected" && (
        <View style={styles.center}>
          <Feather name="x-circle" size={80} color="#E53935" style={{ marginBottom: 24 }} />
          <Text style={[styles.statusText, { color: theme.corTextoPrincipal, marginBottom: 12 }]}>
            Pagamento não aprovado
          </Text>
          <Text style={[styles.hint, { color: theme.textoSecundario, marginBottom: 32 }]}>
            {errorMsg}
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.corBotoes }]}
            onPress={handleRetry}
          >
            <Text style={[styles.btnText, { color: theme.textoBotoes }]}>Tentar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelLink} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "900" },
  webview: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  statusText: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  hint: { fontSize: 14, fontWeight: "600", textAlign: "center", marginTop: 16, lineHeight: 22 },
  qrImage: { width: 240, height: 240, marginBottom: 24 },
  btn: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 32,
    marginBottom: 16,
  },
  btnText: { fontSize: 16, fontWeight: "900", textTransform: "uppercase" },
  cancelLink: { padding: 12 },
  cancelText: { color: "#E53935", fontSize: 14, fontWeight: "900", textDecorationLine: "underline" },
});
