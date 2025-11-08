<script setup lang="ts">
interface Props {
  title?: string
  message: string
  icon?: string
  showRetry?: boolean
  retryText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Error',
  icon: 'mdi:alert-circle-outline',
  showRetry: true,
  retryText: 'Retry'
})

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="error-state">
    <div class="error-state__content">
      <Icon
        :name="icon"
        class="error-state__icon"
      />
      <h3 class="error-state__title">{{ title }}</h3>
      <p class="error-state__message">{{ message }}</p>
      <button
        v-if="showRetry"
        class="error-state__retry"
        @click="emit('retry')"
      >
        <Icon name="mdi:refresh" />
        {{ retryText }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-state {
  @include flex-center;
  padding: $spacing-12 $spacing-4;
  min-height: 400px;

  &__content {
    @include flex-center;
    @include flex-column;
    gap: $spacing-3;
    max-width: 500px;
    text-align: center;
    padding: $spacing-8;
    background-color: rgba($error, 0.05);
    border-radius: $radius-lg;
    border: 2px solid rgba($error, 0.1);
  }

  &__icon {
    font-size: 64px;
    color: $error;
    animation: shake 0.5s ease-in-out;
  }

  &__title {
    margin: 0;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $error-dark;
  }

  &__message {
    margin: 0;
    font-size: $font-size-base;
    color: $text-secondary;
    line-height: $line-height-relaxed;
  }

  &__retry {
    @include flex-center;
    gap: $spacing-2;
    margin-top: $spacing-2;
    padding: $button-padding-md;
    background-color: $error;
    color: $white;
    border: none;
    border-radius: $button-border-radius;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    cursor: pointer;
    transition: all $transition-base;

    &:hover {
      background-color: $error-dark;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }

    &:active {
      transform: translateY(0);
    }
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-8px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(8px);
  }
}
</style>
