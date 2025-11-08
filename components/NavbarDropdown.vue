<script setup lang="ts">
import type { ComputedRef } from 'vue'

interface DropdownItem {
  to: string
  label: string
  icon: string
  badge?: ComputedRef<number>
}

interface Props {
  label: string
  icon: string
  items: DropdownItem[]
}

const props = defineProps<Props>()
const route = useRoute()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

let hoverTimeout: NodeJS.Timeout | null = null

// Check if any item in dropdown is active
const hasActiveItem = computed(() => {
  return props.items.some(item => {
    if (item.to === '/generations') {
      return route.path.startsWith('/generations')
    }
    return route.path === item.to
  })
})

// Open dropdown
const openDropdown = () => {
  isOpen.value = true
}

// Close dropdown
const closeDropdown = () => {
  isOpen.value = false
}

// Handle hover (desktop)
const handleMouseEnter = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
  }
  hoverTimeout = setTimeout(() => {
    openDropdown()
  }, 200)
}

const handleMouseLeave = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
  }
  hoverTimeout = setTimeout(() => {
    closeDropdown()
  }, 300)
}

// Handle click (mobile/desktop toggle)
const handleClick = () => {
  isOpen.value = !isOpen.value
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownRef.value &&
    triggerRef.value &&
    !dropdownRef.value.contains(event.target as Node) &&
    !triggerRef.value.contains(event.target as Node)
  ) {
    closeDropdown()
  }
}

// Handle keyboard
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdown()
    triggerRef.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
  }
})

// Close on route change
watch(() => route.path, () => {
  closeDropdown()
})
</script>

<template>
  <div
    class="navbar-dropdown"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <button
      ref="triggerRef"
      class="navbar-dropdown__trigger"
      :class="{ 'navbar-dropdown__trigger--active': hasActiveItem || isOpen }"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      @click="handleClick"
    >
      <Icon :name="icon" aria-hidden="true" />
      <span>{{ label }}</span>
      <Icon
        name="mdi:chevron-down"
        class="navbar-dropdown__arrow"
        :class="{ 'navbar-dropdown__arrow--open': isOpen }"
        aria-hidden="true"
      />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="navbar-dropdown__menu"
        role="menu"
        :aria-label="`${label} menu`"
      >
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="navbar-dropdown__item"
          :class="{ 'navbar-dropdown__item--active': route.path === item.to || (item.to === '/generations' && route.path.startsWith('/generations')) }"
          role="menuitem"
          @click="closeDropdown"
        >
          <Icon :name="item.icon" aria-hidden="true" />
          <span>{{ item.label }}</span>
          <span
            v-if="item.badge && item.badge.value > 0"
            class="navbar-dropdown__badge"
            :aria-label="`${item.badge.value} items`"
          >
            {{ item.badge.value }}
          </span>
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.navbar-dropdown {
  position: relative;

  &__trigger {
    @include reset-button;
    @include flex-center;
    position: relative;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    color: rgba($white, 0.9);
    font-weight: $font-weight-medium;
    border-radius: $radius-lg;
    transition: all $transition-fast;
    cursor: pointer;

    &:hover {
      background: rgba($white, 0.1);
      color: $white;
    }

    &--active {
      background: rgba($white, 0.2);
      color: $white;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 3px;
        background: $accent;
        border-radius: $radius-full;
      }
    }

    svg:first-child {
      font-size: 20px;
    }
  }

  &__arrow {
    font-size: 16px;
    transition: transform $transition-fast;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    top: calc(100% + $spacing-2);
    left: 0;
    min-width: 220px;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-2xl;
    padding: $spacing-2;
    z-index: $z-index-dropdown;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  &__item {
    @include flex-center;
    gap: $spacing-3;
    padding: $spacing-3 $spacing-4;
    color: $text-primary;
    text-decoration: none;
    border-radius: $radius-md;
    transition: all $transition-fast;
    white-space: nowrap;

    &:hover {
      background: $gray-100;
      color: $primary;
    }

    &--active {
      background: rgba($primary, 0.1);
      color: $primary;
      font-weight: $font-weight-semibold;
    }

    svg {
      font-size: 18px;
    }

    span:nth-child(2) {
      flex: 1;
    }
  }

  &__badge {
    @include flex-center;
    min-width: 20px;
    height: 20px;
    padding: 0 $spacing-1;
    background: $accent;
    color: $accent-dark;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
  }
}

// Dropdown animation
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// Hide dropdown on mobile (will use different approach)
@media (max-width: $breakpoint-lg) {
  .navbar-dropdown {
    display: none;
  }
}
</style>
