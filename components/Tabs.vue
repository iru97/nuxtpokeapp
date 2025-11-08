<script setup lang="ts">
interface Tab {
  id: string
  label: string
  icon?: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectTab = (tabId: string) => {
  emit('update:modelValue', tabId)
}
</script>

<template>
  <div class="tabs">
    <div class="tabs__nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tabs__button"
        :class="{ 'tabs__button--active': modelValue === tab.id }"
        @click="selectTab(tab.id)"
      >
        <Icon v-if="tab.icon" :name="tab.icon" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div class="tabs__content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  @include flex-column;
  gap: $spacing-6;

  &__nav {
    display: flex;
    gap: $spacing-2;
    overflow-x: auto;
    @include custom-scrollbar(4px, transparent, $gray-300);
    padding-bottom: $spacing-2;
    // Snap scrolling for better mobile UX
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch; // Smooth scrolling on iOS

    @media (max-width: $breakpoint-md) {
      gap: $spacing-1;
      padding: 0 $spacing-2 $spacing-2;
      margin: 0 (-$spacing-2);
    }

    @media (max-width: $breakpoint-sm) {
      padding: 0 $spacing-1 $spacing-2;
      margin: 0 (-$spacing-1);
    }
  }

  &__button {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-3 $spacing-5;
    background: $white;
    color: $text-secondary;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    white-space: nowrap;
    transition: all $transition-fast;
    cursor: pointer;
    scroll-snap-align: start;
    flex-shrink: 0; // Prevent tabs from shrinking

    &:hover:not(&--active) {
      background: $gray-50;
      border-color: $gray-300;
      color: $text-primary;
    }

    &--active {
      background: $primary;
      color: $white;
      border-color: $primary;
      box-shadow: $shadow-md;

      svg {
        color: $white;
      }
    }

    svg {
      font-size: 20px;
      transition: color $transition-fast;
    }

    @media (max-width: $breakpoint-md) {
      padding: $spacing-2 $spacing-4;
      font-size: $font-size-sm;
      gap: $spacing-1;

      svg {
        font-size: 18px;
      }
    }

    @media (max-width: $breakpoint-sm) {
      padding: $spacing-2 $spacing-3;
      font-size: $font-size-xs;

      svg {
        font-size: 16px;
      }

      span {
        display: none; // Hide text labels on very small screens, show only icons
      }

      // Make icon-only buttons more square
      min-width: 44px; // Touch target size
      min-height: 44px;
      padding: $spacing-2;
    }

    // Show text on active tab even on mobile
    &--active {
      @media (max-width: $breakpoint-sm) {
        span {
          display: inline; // Show label for active tab
        }
        padding: $spacing-2 $spacing-3;
      }
    }
  }

  &__content {
    animation: fadeIn 0.3s ease-out;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
