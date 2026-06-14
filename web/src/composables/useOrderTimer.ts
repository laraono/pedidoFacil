import { ref, onMounted, onUnmounted } from "vue";

type OrderLike = { createdAt: Date | string | null }
type OrderOrGetter = OrderLike | (() => OrderLike | null | undefined)

export function useOrderTimer(orderOrGetter: OrderOrGetter, alertMinutes: number | (() => number)) {
  const elapsedTime = ref("00:00");
  const isDelayed = ref(false);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  function getCreatedAt(): Date | null {
    const val = typeof orderOrGetter === "function"
      ? orderOrGetter()?.createdAt
      : orderOrGetter?.createdAt;
    return val instanceof Date ? val : (val ? new Date(val) : null);
  }

  function update() {
    const createdAt = getCreatedAt();
    if (!createdAt || isNaN(createdAt.getTime())) return;
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
    update();
    timerInterval = setInterval(update, 1000);
  });

  onUnmounted(() => {
    if (timerInterval !== null) clearInterval(timerInterval);
  });

  return { elapsedTime, isDelayed };
}
