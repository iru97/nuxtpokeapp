<script setup lang="ts">
interface Props {
  label: string
  value: number
  maxValue?: number
  color?: string
  showValue?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxValue: 255,
  showValue: true,
  animated: true
})

const percentage = computed(() => {
  return Math.min((props.value / props.maxValue) * 100, 100)
})

const statColor = computed(() => {
  if (props.color) return props.color

  // Auto-color based on stat name
  const statColors: Record<string, string> = {
    hp: '#ff5959',
    attack: '#f5ac78',
    defense: '#fae078',
    'special-attack': '#9db7f5',
    'special-defense': '#a7db8d',
    speed: '#fa92b2',
  }

  return statColors[props.label.toLowerCase()] || '#9e9e9e'
})

const strengthLevel = computed(() => {
  if (props.value >= 150) return 'excellent'
  if (props.value >= 100) return 'great'
  if (props.value >= 70) return 'good'
  if (props.value >= 40) return 'average'
  return 'low'
})
</script>

<template>
  <div class="stat-bar">
    <div class="stat-bar__header">
      <span class="stat-bar__label">{{ label }}</span>
      <span v-if="showValue" class="stat-bar__value">{{ value }}</span>
    </div>
    <div class="stat-bar__track">
      <div
        class="stat-bar__fill"
        :class="{ 'stat-bar__fill--animated': animated, [`stat-bar__fill--${strengthLevel}`]: true }"
        :style="{ width: `${percentage}%`, backgroundColor: statColor }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat-bar {
  width: 100%;

  &__header {
    @include flex-between;
    margin-bottom: $spacing-2;
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    text-transform: capitalize;
  }

  &__value {
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: $text-secondary;
    font-family: $font-family-mono;
  }

  &__track {
    position: relative;
    width: 100%;
    height: 8px;
    background-color: $gray-200;
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    border-radius: $radius-full;
    transition: width $transition-slow;

    &--animated {
      animation: fillBar 1s ease-out;
    }

    &--excellent {
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
    }

    &--great {
      box-shadow: 0 0 6px rgba(76, 175, 80, 0.5);
    }

    &--good {
      box-shadow: 0 0 4px rgba(33, 150, 243, 0.4);
    }
  }
}

@keyframes fillBar {
  from {
    width: 0;
  }
}
</style>
