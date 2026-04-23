import { useRef, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

const INACTIVITY_TIMEOUT = 60_000; // 60 segundos

export function useInactivityTimer(timeout = INACTIVITY_TIMEOUT) {
  const timer = useRef(null);
  const navigation = useNavigation();

  const resetTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    }, timeout);
  }, [navigation, timeout]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [resetTimer]);

  return resetTimer;
}
