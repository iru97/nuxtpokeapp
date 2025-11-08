<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: '#ef5350',
  message: ''
})

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}
</script>

<template>
  <div class="loading-spinner">
    <div
      class="spinner"
      :class="sizeClasses[size]"
      :style="{ borderTopColor: color, borderRightColor: color }"
    />
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<style scoped lang="scss">
.loading-spinner {
  @include flex-center;
  @include flex-column;
  gap: $spacing-3;
  padding: $spacing-6;
}

.spinner {
  border: 3px solid $gray-200;
  border-top-color: $primary;
  border-right-color: $primary;
  border-radius: $radius-full;
  animation: spin 0.8s linear infinite;
}

.w-4 { width: 16px; height: 16px; border-width: 2px; }
.w-8 { width: 32px; height: 32px; }
.w-12 { width: 48px; height: 48px; border-width: 4px; }
.w-16 { width: 64px; height: 64px; border-width: 4px; }

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  margin: 0;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
}
</style>
