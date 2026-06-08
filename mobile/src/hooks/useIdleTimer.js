import { useRef, useEffect, useCallback } from "react";
import { PanResponder } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../contexts/CartContext";

export function useIdleTimer(timeoutSeconds = 60) {
  const navigation = useNavigation();
  const { clearCart } = useCart();
  const timerId = useRef(null);
  const resetTimerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerId.current) clearTimeout(timerId.current);

    timerId.current = setTimeout(() => {
      clearCart();
      navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
    }, timeoutSeconds * 1000);
  }, [navigation, clearCart, timeoutSeconds]);

  resetTimerRef.current = resetTimer;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimerRef.current?.();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetTimerRef.current?.();
        return false;
      },
    }),
  ).current;

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, [resetTimer]);

  return panResponder.panHandlers;
}
