import React, { useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useError } from "../contexts/ErrorContext";

import imgLogo from "../../assets/logo.png";
import patternOndas from "../../assets/ondas.png";

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const { errorMessage, setErrorMessage } = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleStart = () => {
    navigation.navigate("Menu");
  };

  return (
    <TouchableOpacity
      style={styles.fullScreenBtn}
      activeOpacity={1}
      onPress={handleStart}
    >
      <Image
        source={patternOndas}
        style={styles.backgroundPattern}
        resizeMode="cover"
      />

      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Animated.View
            style={[styles.logoWrapper, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={styles.logoCircle}>
              <Image
                source={imgLogo}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
            Peça aqui e{"\n"}evite filas
          </Text>

          <Text style={styles.subtitle}>Rápido, fácil e do seu jeito.</Text>
        </View>
        {
          errorMessage && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={20} color="#FFF" />
               <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity onPress={() => setErrorMessage(null)}>
                <Feather name="x" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          )
        }

        <View style={styles.bottomContent}>
          <Animated.View
            style={[
              styles.touchIndicator,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.touchText}>Toque para começar</Text>
            <Feather
              name="arrow-right"
              size={24}
              color={theme.textoBotoes}
              style={styles.pointerIcon}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </TouchableOpacity>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    fullScreenBtn: {
      flex: 1,
      backgroundColor: theme.fundoGeral,
    },
    backgroundPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.08,
      width: "100%",
      height: "100%",
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    bottomContent: {
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: 30,
    },
    logoWrapper: {
      marginBottom: 40,
    },
    logoCircle: {
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: theme.corBotoes,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      elevation: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3, 
      shadowRadius: 12,
    },
    logoImage: {
      width: "70%",
      height: "70%",
    },
    title: {
      fontSize: 42,
      fontWeight: "900",
      color: theme.corTextoPrincipal,
      textAlign: "center",
      marginBottom: 16,
      letterSpacing: -1.5,
      lineHeight: 46,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.textoSecundario,
      textAlign: "center",
    },
    touchIndicator: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.corBotoes,
      width: "100%",
      maxWidth: 350,
      paddingVertical: 20,
      borderRadius: 40,
      elevation: 10,
      shadowColor: theme.corBotoes,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    pointerIcon: {
      marginLeft: 12,
    },
    touchText: {
      fontSize: 20,
      fontWeight: "900",
      color: theme.textoBotoes,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    errorBanner: {
      position: "absolute",
      top: 60, // Positioned at the top of the SafeArea
      left: 24,
      right: 24,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#e74c3c", 
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 20, 
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    errorText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF", /
      marginLeft: 12,
      lineHeight: 20,
    },
  });