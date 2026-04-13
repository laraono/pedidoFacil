import { useRef, useEffect } from "react";
import { PanResponder } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../contexts/CartContext";

export function useIdleTimer(timeoutSeconds = 60) {
  const navigation = useNavigation();
  const { clearCart } = useCart();
  const timerId = useRef(null);

  const resetTimer = () => {
    if (timerId.current) clearTimeout(timerId.current);

    timerId.current = setTimeout(() => {
      clearCart();
      navigation.navigate("Welcome");
    }, timeoutSeconds * 1000);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
    }),
  ).current;

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, []);

  return panResponder.panHandlers;
}
