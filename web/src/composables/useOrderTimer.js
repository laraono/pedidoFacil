import { ref, onMounted, onUnmounted } from "vue";

export function useOrderTimer(order, alertMinutes) {
  const elapsedTime = ref("00:00");
  const isDelayed = ref(false);
  let timerInterval = null;

  function update() {
    const diff = Math.floor((Date.now() - new Date(order.createdAt)) / 1000);
    const h = Math.floor(diff / 3600).toString().padStart(2, "0");
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
    const s = (diff % 60).toString().padStart(2, "0");
    elapsedTime.value = h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
    isDelayed.value = diff > alertMinutes * 60;
  }

  onMounted(() => {
    update();
    timerInterval = setInterval(update, 1000);
  });

  onUnmounted(() => clearInterval(timerInterval));

  return { elapsedTime, isDelayed };
}
