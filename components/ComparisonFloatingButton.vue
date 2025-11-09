<script setup lang="ts">
const comparisonStore = useComparisonStore()
const router = useRouter()

// Initialize store
onMounted(() => {
  comparisonStore.init()
})

// Navigate to comparison page
const goToComparison = () => {
  router.push('/compare')
}
</script>

<template>
  <Transition name="slide-up">
    <button
      v-if="comparisonStore.count > 0"
      class="comparison-floating-btn"
      @click="goToComparison"
    >
      <div class="comparison-floating-btn__content">
        <Icon name="mdi:compare" class="comparison-floating-btn__icon" />
        <div class="comparison-floating-btn__text">
          <span class="comparison-floating-btn__label">Compare</span>
          <span class="comparison-floating-btn__count">
            {{ comparisonStore.count }} Pokémon
          </span>
        </div>
      </div>
      <div class="comparison-floating-btn__badge">
        {{ comparisonStore.count }}
      </div>
    </button>
  </Transition>
</template>

<style scoped lang="scss">
.comparison-floating-btn {
  @include reset-button;
  position: fixed;
  bottom: $spacing-6;
  right: $spacing-6;
  z-index: $z-index-dropdown;
  @include flex-between;
  gap: $spacing-3;
  padding: $spacing-4 $spacing-5;
  background: $primary;
  color: $white;
  border-radius: $radius-full;
  box-shadow: $shadow-xl;
  transition: all $transition-base;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba($primary, 0.4);
  }

  &:active {
    transform: translateY(-2px);
  }

  &__content {
    @include flex-center;
    gap: $spacing-3;
  }

  &__icon {
    font-size: 28px;
    animation: pulse 2s ease-in-out infinite;
  }

  &__text {
    @include flex-column;
    align-items: flex-start;
    gap: 0;
  }

  &__label {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
  }

  &__count {
    font-size: $font-size-sm;
    opacity: 0.9;
  }

  &__badge {
    @include flex-center;
    min-width: 32px;
    height: 32px;
    padding: 0 $spacing-2;
    background: $white;
    color: $primary;
    border-radius: $radius-full;
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    font-family: $font-family-mono;
  }

  @media (max-width: $breakpoint-sm) {
    bottom: $spacing-4;
    right: $spacing-4;
    padding: $spacing-3 $spacing-4;

    &__icon {
      font-size: 24px;
    }

    &__label {
      font-size: $font-size-sm;
    }

    &__count {
      font-size: $font-size-xs;
    }

    &__badge {
      min-width: 28px;
      height: 28px;
      font-size: $font-size-sm;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100px);
}
</style>
