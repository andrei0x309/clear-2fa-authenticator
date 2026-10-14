<template>
  <div
    class="circle-progress-container"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg class="progress-ring" :width="size" :height="size">
      <!-- Background Circle -->
      <circle
        class="progress-ring__background"
        stroke="#e5e7eb"
        :stroke-width="strokeWidth"
        fill="transparent"
        :r="radius"
        :cx="center"
        :cy="center"
      />
      <!-- Progress Circle -->
      <circle
        class="progress-ring__circle"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        fill="transparent"
        :r="radius"
        :cx="center"
        :cy="center"
        :style="{ strokeDashoffset: dashOffset }"
        :stroke-dasharray="circumference"
      />
    </svg>
    <div class="counter-text" :style="{ color: progressColor, fontSize: fontSize }">
      <span class="value">{{ counter }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Define props with TypeScript, including a customizable 'size' prop
const props = defineProps({
  counter: {
    type: Number,
    default: 30,
  },
  size: {
    type: Number,
    default: 80, // Default to a smaller size (80px), you can pass any number like :size="50" or :size="120"
  },
});

// Dynamically calculate SVG dimensions based on the 'size' prop
const center = computed(() => props.size / 2);
const strokeWidth = computed(() => Math.max(4, props.size * 0.08)); // Scales stroke nicely
const radius = computed(() => props.size / 2 - strokeWidth.value / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

// Clamp counter between 0 and 30
const clampedCounter = computed(() => {
  return Math.max(0, Math.min(30, props.counter));
});

// Inverse progress: 30 is full (1.0), 0 is empty (0.0)
const progressPercentage = computed(() => {
  return clampedCounter.value / 30;
});

// Calculate SVG stroke offset based on progress
const dashOffset = computed(() => {
  return circumference.value - progressPercentage.value * circumference.value;
});

// Dynamic color based on thresholds
const progressColor = computed(() => {
  const val = clampedCounter.value;
  if (val > 20) {
    return "#10b981"; // Green (30 to 20)
  } else if (val > 10) {
    return "#f59e0b"; // Yellow / Amber (20 to 10)
  } else {
    return "#ef4444"; // Red (10 to 0)
  }
});

// Dynamically scale font size based on component size
const fontSize = computed(() => `${Math.max(12, props.size * 0.28)}px`);
</script>

<style scoped>
.circle-progress-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg); /* Starts progress from the top */
}

.progress-ring__circle {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease-in-out;
}

.counter-text {
  position: absolute;
  font-weight: 800;
  transition: color 0.4s ease-in-out;
}
</style>
