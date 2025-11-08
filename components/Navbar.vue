<script setup lang="ts">
const showMobileMenu = ref(false)
const showSearchModal = ref(false)
const searchQuery = ref('')
const router = useRouter()
const route = useRoute()

const favoritesStore = useFavoritesStore()
const comparisonStore = useComparisonStore()
const teamStore = useTeamStore()
const filtersStore = useFiltersStore()
const { isDark, toggleDark, initDarkMode } = useDarkMode()

const favoritesCount = computed(() => favoritesStore.favorites.length)
const comparisonCount = computed(() => comparisonStore.count)
const teamCount = computed(() => teamStore.teamSize)

// Initialize stores and dark mode
onMounted(() => {
  comparisonStore.init()
  teamStore.init()
  initDarkMode()
})

// Navigation links
const navLinks = [
  { to: '/', label: 'Home', icon: 'mdi:home' },
  { to: '/pokemons', label: 'Pokédex', icon: 'mdi:pokeball' },
  { to: '/advanced-search', label: 'Advanced Search', icon: 'mdi:filter-cog' },
  { to: '/generations', label: 'Generations', icon: 'mdi:earth' },
  { to: '/team-builder', label: 'Team Builder', icon: 'mdi:account-group', badge: teamCount },
  { to: '/compare', label: 'Compare', icon: 'mdi:compare', badge: comparisonCount },
  { to: '/favorites', label: 'Favorites', icon: 'mdi:heart', badge: favoritesCount },
  { to: '/stats', label: 'Stats', icon: 'mdi:chart-box-outline' },
]

const isActiveRoute = (path: string) => {
  if (path === '/generations') {
    return route.path.startsWith('/generations')
  }
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
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar__container">
      <!-- Logo -->
      <NuxtLink to="/" class="navbar__logo" @click="closeMobileMenu" aria-label="PokéApp home">
        <Icon name="mdi:pokeball" class="navbar__logo-icon" aria-hidden="true" />
        <span class="navbar__logo-text">PokéApp</span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <ul class="navbar__nav" role="menubar">
        <li v-for="link in navLinks" :key="link.to" role="none">
          <NuxtLink
            :to="link.to"
            class="navbar__link"
            :class="{ 'navbar__link--active': isActiveRoute(link.to) }"
            role="menuitem"
            :aria-current="isActiveRoute(link.to) ? 'page' : undefined"
          >
            <Icon :name="link.icon" aria-hidden="true" />
            <span>{{ link.label }}</span>
            <span v-if="link.badge && link.badge.value > 0" class="navbar__badge" :aria-label="`${link.badge.value} items`">
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
          aria-label="Search Pokémon (Keyboard shortcut: Control or Command + K)"
          @click="openSearch"
        >
          <Icon name="mdi:magnify" aria-hidden="true" />
          <span class="navbar__search-hint" aria-hidden="true">⌘K</span>
        </button>

        <!-- Theme Toggle -->
        <button
          class="navbar__action-btn navbar__theme-toggle"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-pressed="isDark"
          @click="toggleDark"
        >
          <Icon :name="isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" aria-hidden="true" />
        </button>

        <!-- Mobile Menu Toggle -->
        <button
          class="navbar__mobile-toggle"
          :aria-label="showMobileMenu ? 'Close menu' : 'Open menu'"
          :aria-expanded="showMobileMenu"
          aria-controls="mobile-menu"
          @click="toggleMobileMenu"
        >
          <Icon :name="showMobileMenu ? 'mdi:close' : 'mdi:menu'" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="slide-down">
      <div v-if="showMobileMenu" id="mobile-menu" class="navbar__mobile-menu" role="menu">
        <ul class="navbar__mobile-nav">
          <li v-for="link in navLinks" :key="link.to" role="none">
            <NuxtLink
              :to="link.to"
              class="navbar__mobile-link"
              :class="{ 'navbar__mobile-link--active': isActiveRoute(link.to) }"
              role="menuitem"
              :aria-current="isActiveRoute(link.to) ? 'page' : undefined"
              @click="closeMobileMenu"
            >
              <Icon :name="link.icon" aria-hidden="true" />
              <span>{{ link.label }}</span>
              <span v-if="link.badge && link.badge.value > 0" class="navbar__badge" :aria-label="`${link.badge.value} items`">
                {{ link.badge.value }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- Search Modal -->
    <Transition name="fade">
      <div
        v-if="showSearchModal"
        class="search-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        @click.self="closeSearch"
      >
        <div class="search-modal__content">
          <div class="search-modal__header">
            <Icon name="mdi:magnify" class="search-modal__icon" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search Pokémon by name or number..."
              class="search-modal__input"
              aria-label="Search Pokémon"
              autofocus
              @keyup.enter="handleSearch"
              @keyup.esc="closeSearch"
            />
            <button
              class="search-modal__close"
              aria-label="Close search"
              @click="closeSearch"
            >
              <Icon name="mdi:close" aria-hidden="true" />
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
    @include spring-bounce;
    @include accessible-focus($accent);
    gap: $spacing-2;
    padding: $spacing-2 $spacing-3;
    background: rgba($white, 0.1);
    color: $white;
    border-radius: $radius-lg;

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
    @include spring-bounce;
    @include accessible-focus($accent);
    width: 40px;
    height: 40px;
    color: $white;
    border-radius: $radius-lg;

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
    @include glass-morphism(0.98, 20px);
    border-radius: $radius-xl;
    box-shadow: $shadow-2xl;
    animation: modalSlideUp 0.3s ease-out;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
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
    @include spring-bounce;
    @include accessible-focus;
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    color: $text-secondary;

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

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.15s ease;
  }
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);

  @media (prefers-reduced-motion: reduce) {
    transform: none;
  }
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);

  @media (prefers-reduced-motion: reduce) {
    transform: none;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Reduced motion support for logo animation
.navbar__logo {
  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;

      .navbar__logo-icon {
        animation: none;
      }
    }
  }
}
</style>
