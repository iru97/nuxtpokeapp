<script setup lang="ts">
const showMobileMenu = ref(false)
const showSearchModal = ref(false)
const searchQuery = ref('')
const router = useRouter()
const route = useRoute()

const favoritesStore = useFavoritesStore()
const filtersStore = useFiltersStore()

const favoritesCount = computed(() => favoritesStore.favorites.length)

// Navigation links
const navLinks = [
  { to: '/', label: 'Home', icon: 'mdi:home' },
  { to: '/pokemons', label: 'Pokédex', icon: 'mdi:pokeball' },
  { to: '/favorites', label: 'Favorites', icon: 'mdi:heart', badge: favoritesCount },
]

const isActiveRoute = (path: string) => {
  return route.path === path
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const openSearch = () => {
  showSearchModal.value = true
}

const closeSearch = () => {
  showSearchModal.value = false
  searchQuery.value = ''
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    filtersStore.setSearch(searchQuery.value.trim())
    router.push('/pokemons')
    closeSearch()
  }
}

// Close mobile menu on route change
watch(() => route.path, () => {
  closeMobileMenu()
})

// Keyboard shortcut for search (Ctrl/Cmd + K)
onMounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      openSearch()
    }
    if (e.key === 'Escape' && showSearchModal.value) {
      closeSearch()
    }
  }

  document.addEventListener('keydown', handleKeyDown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
})
</script>

<template>
  <nav class="navbar">
    <div class="navbar__container">
      <!-- Logo -->
      <NuxtLink to="/" class="navbar__logo" @click="closeMobileMenu">
        <Icon name="mdi:pokeball" class="navbar__logo-icon" />
        <span class="navbar__logo-text">PokéApp</span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <ul class="navbar__nav">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="navbar__link"
            :class="{ 'navbar__link--active': isActiveRoute(link.to) }"
          >
            <Icon :name="link.icon" />
            <span>{{ link.label }}</span>
            <span v-if="link.badge && link.badge.value > 0" class="navbar__badge">
              {{ link.badge.value }}
            </span>
          </NuxtLink>
        </li>
      </ul>

      <!-- Actions -->
      <div class="navbar__actions">
        <!-- Search Button -->
        <button
          class="navbar__action-btn"
          title="Search (Ctrl+K)"
          @click="openSearch"
        >
          <Icon name="mdi:magnify" />
          <span class="navbar__search-hint">⌘K</span>
        </button>

        <!-- Mobile Menu Toggle -->
        <button
          class="navbar__mobile-toggle"
          @click="toggleMobileMenu"
        >
          <Icon :name="showMobileMenu ? 'mdi:close' : 'mdi:menu'" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="slide-down">
      <div v-if="showMobileMenu" class="navbar__mobile-menu">
        <ul class="navbar__mobile-nav">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="navbar__mobile-link"
              :class="{ 'navbar__mobile-link--active': isActiveRoute(link.to) }"
              @click="closeMobileMenu"
            >
              <Icon :name="link.icon" />
              <span>{{ link.label }}</span>
              <span v-if="link.badge && link.badge.value > 0" class="navbar__badge">
                {{ link.badge.value }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- Search Modal -->
    <Transition name="fade">
      <div v-if="showSearchModal" class="search-modal" @click.self="closeSearch">
        <div class="search-modal__content">
          <div class="search-modal__header">
            <Icon name="mdi:magnify" class="search-modal__icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search Pokémon by name or number..."
              class="search-modal__input"
              autofocus
              @keyup.enter="handleSearch"
              @keyup.esc="closeSearch"
            />
            <button
              class="search-modal__close"
              @click="closeSearch"
            >
              <Icon name="mdi:close" />
            </button>
          </div>

          <div class="search-modal__footer">
            <span class="search-modal__hint">
              <kbd>Enter</kbd> to search
            </span>
            <span class="search-modal__hint">
              <kbd>Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped lang="scss">
.navbar {
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  box-shadow: $shadow-md;

  &__container {
    @include flex-between;
    max-width: $container-2xl;
    margin: 0 auto;
    padding: $spacing-4 $spacing-6;
    gap: $spacing-6;
  }

  &__logo {
    @include flex-center;
    gap: $spacing-2;
    color: $white;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    text-decoration: none;
    transition: all $transition-fast;

    &:hover {
      transform: scale(1.05);

      .navbar__logo-icon {
        animation: spin 0.6s ease-in-out;
      }
    }
  }

  &__logo-icon {
    font-size: 32px;
  }

  &__logo-text {
    display: none;

    @media (min-width: $breakpoint-sm) {
      display: block;
    }
  }

  &__nav {
    display: none;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: $spacing-2;

    @media (min-width: $breakpoint-md) {
      @include flex-center;
    }
  }

  &__link {
    @include flex-center;
    position: relative;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    color: rgba($white, 0.9);
    font-weight: $font-weight-medium;
    text-decoration: none;
    border-radius: $radius-lg;
    transition: all $transition-fast;

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

    svg {
      font-size: 20px;
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

  &__actions {
    @include flex-center;
    gap: $spacing-2;
  }

  &__action-btn {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-3;
    background: rgba($white, 0.1);
    color: $white;
    border-radius: $radius-lg;
    transition: all $transition-fast;

    &:hover {
      background: rgba($white, 0.2);
    }

    svg {
      font-size: 20px;
    }
  }

  &__search-hint {
    display: none;
    padding: 2px $spacing-2;
    background: rgba($white, 0.2);
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-family: $font-family-mono;

    @media (min-width: $breakpoint-md) {
      display: block;
    }
  }

  &__mobile-toggle {
    @include reset-button;
    @include flex-center;
    width: 40px;
    height: 40px;
    color: $white;
    border-radius: $radius-lg;
    transition: all $transition-fast;

    &:hover {
      background: rgba($white, 0.1);
    }

    svg {
      font-size: 24px;
    }

    @media (min-width: $breakpoint-md) {
      display: none;
    }
  }

  &__mobile-menu {
    background: darken($primary, 5%);
    border-top: 1px solid rgba($white, 0.1);
    box-shadow: $shadow-lg;

    @media (min-width: $breakpoint-md) {
      display: none;
    }
  }

  &__mobile-nav {
    list-style: none;
    margin: 0;
    padding: $spacing-4;
  }

  &__mobile-link {
    @include flex-between;
    padding: $spacing-3 $spacing-4;
    color: rgba($white, 0.9);
    font-weight: $font-weight-medium;
    text-decoration: none;
    border-radius: $radius-lg;
    transition: all $transition-fast;

    &:hover {
      background: rgba($white, 0.1);
      color: $white;
    }

    &--active {
      background: rgba($white, 0.2);
      color: $white;
    }

    svg {
      font-size: 20px;
    }
  }
}

.search-modal {
  @include overlay(rgba(0, 0, 0, 0.7), $z-index-modal);
  @include flex-center;
  padding: $spacing-4;

  &__content {
    width: 100%;
    max-width: 600px;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-2xl;
    animation: modalSlideUp 0.3s ease-out;
  }

  &__header {
    @include flex-center;
    gap: $spacing-3;
    padding: $spacing-6;
  }

  &__icon {
    font-size: 32px;
    color: $text-secondary;
  }

  &__input {
    flex: 1;
    padding: $spacing-3;
    border: none;
    font-size: $font-size-lg;
    outline: none;

    &::placeholder {
      color: $text-hint;
    }
  }

  &__close {
    @include reset-button;
    @include flex-center;
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    color: $text-secondary;
    transition: all $transition-fast;

    &:hover {
      background: $gray-100;
      color: $text-primary;
    }

    svg {
      font-size: 24px;
    }
  }

  &__footer {
    @include flex-center;
    gap: $spacing-4;
    padding: $spacing-4 $spacing-6;
    border-top: 1px solid $gray-200;
  }

  &__hint {
    @include flex-center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    color: $text-secondary;

    kbd {
      padding: $spacing-1 $spacing-2;
      background: $gray-100;
      border: 1px solid $gray-300;
      border-radius: $radius-sm;
      font-family: $font-family-mono;
      font-size: $font-size-xs;
    }
  }
}

// Animations
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
