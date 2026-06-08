import { ref, onMounted, onUnmounted, watch, toRef } from "vue";

export function useOrderTimer(orderOrGetter, alertMinutes) {
  const elapsedTime = ref("00:00");
  const isDelayed = ref(false);
  let timerInterval = null;

  function getCreatedAt() {
    const val = typeof orderOrGetter === "function"
      ? orderOrGetter()
      : orderOrGetter?.createdAt;
    return val instanceof Date ? val : (val ? new Date(val) : null);
  }

  function update() {
    const createdAt = getCreatedAt();
    if (!createdAt || isNaN(createdAt.getTime())) {
      return;
    }
    const raw = Date.now() - createdAt.getTime();
    const diff = Math.max(0, Math.floor(raw / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
    const s = (diff % 60).toString().padStart(2, "0");
    elapsedTime.value = h > 0 ? `${h.toString().padStart(2, "0")}:${m}:${s}` : `${m}:${s}`;
    const alertSecs = (typeof alertMinutes === "function" ? alertMinutes() : alertMinutes) * 60;
    isDelayed.value = diff > alertSecs;
  }

  onMounted(() => {
    const debugVal = getCreatedAt();
    console.log('[Timer] createdAt recebido:', debugVal, '| tipo:', typeof debugVal, '| válido:', debugVal instanceof Date && !isNaN(debugVal.getTime()));
    update();
    timerInterval = setInterval(update, 1000);
  });

  onUnmounted(() => clearInterval(timerInterval));

  return { elapsedTime, isDelayed };
}
